import { promises as fs } from 'fs';
import * as path from 'path';
import axios from 'axios';

interface BackupOptions {
    time: number;
    path?: string;
}

interface ClearLogsOptions {
    time: number;
    whiteList?: LogLevel[];
}

interface ExternalLogOptions {
    url: string;
    headers?: Record<string, string>;
}

interface LoggerTypes {
    logDir?: string;
    format?: 'plain' | 'json';
    maxFileSize?: number;
    environment?: 'development' | 'production';
    backup?: BackupOptions;
    clearLogs?: ClearLogsOptions;
    externalLog?: ExternalLogOptions;
}

type LogLevel = 'error' | 'info' | 'debug' | 'warn' | 'log';

export class Logger {
    private logDir: string;
    private format: 'plain' | 'json';
    private maxFileSize: number;
    private environment: 'development' | 'production';
    private backup?: BackupOptions;
    private clearLogs?: ClearLogsOptions;
    private externalLog?: ExternalLogOptions;

    constructor(options: LoggerTypes = {}) {
        this.logDir = options.logDir || 'log';
        this.format = options.format || 'plain';
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
        this.environment = options.environment || 'development';
        this.backup = options.backup;
        this.clearLogs = options.clearLogs;
        this.externalLog = options.externalLog;

        // Bind methods to ensure correct context
        this.error = this.error.bind(this);
        this.info = this.info.bind(this);
        this.debug = this.debug.bind(this);
        this.warn = this.warn.bind(this);
        this.log = this.log.bind(this);
        this.getLogs = this.getLogs.bind(this);
        this._log = this._log.bind(this);
        this._getFilePath = this._getFilePath.bind(this);
        this._formatLog = this._formatLog.bind(this);
        this._rotateLogIfNeeded = this._rotateLogIfNeeded.bind(this);
        this._appendLog = this._appendLog.bind(this);
        this._readLog = this._readLog.bind(this);
        this._setupBackup = this._setupBackup.bind(this);
        this._performBackup = this._performBackup.bind(this);
        this._setupAutoClear = this._setupAutoClear.bind(this);
        this._clearLogs = this._clearLogs.bind(this);
        this._sendToExternalLog = this._sendToExternalLog.bind(this);

        // Set up backup if options are provided
        if (this.backup) {
            this._setupBackup();
        }

        // Set up automatic log clearing if options are provided
        if (this.clearLogs) {
            this._setupAutoClear();
        }
    }

    async error(text: string): Promise<void> {
        await this._log('error', text);
    }

    async info(text: string): Promise<void> {
        await this._log('info', text);
    }

    async debug(text: string): Promise<void> {
        await this._log('debug', text);
    }

    async warn(text: string): Promise<void> {
        await this._log('warn', text);
    }

    async log(text: string): Promise<void> {
        await this._log('log', text);
    }

    async getLogs(level: LogLevel, date?: string): Promise<string> {
        return await this._readLog(this._getFilePath(level), date);
    }

    private async _log(level: LogLevel, text: string): Promise<void> {
        if (this.environment === 'production' && level === 'debug') {
            return; // Skip debug logs in production
        }

        const filePath = this._getFilePath(level);
        const formattedText = this._formatLog(level, text);

        (console[level] as (message?: any, ...optionalParams: any[]) => void)(formattedText);
        await this._rotateLogIfNeeded(filePath);
        await this._appendLog(filePath, formattedText);

        if (this.externalLog) {
            await this._sendToExternalLog(level, formattedText);
        }
    }

    private _getFilePath(level: LogLevel): string {
        return path.join(this.logDir, `${level}.log`);
    }

    private _formatLog(level: LogLevel, text: string): string {
        const timestamp = new Date().toISOString();
        if (this.format === 'json') {
            return JSON.stringify({ timestamp, level, message: text });
        }
        return `${timestamp} - ${level.toUpperCase()}: ${text}`;
    }

    private async _rotateLogIfNeeded(filePath: string): Promise<void> {
        try {
            const stats = await fs.stat(filePath);
            if (stats.size >= this.maxFileSize) {
                const newPath = `${filePath}.${Date.now()}`;
                await fs.rename(filePath, newPath);
            }
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
                console.error(`Failed to check log file size: ${(err as Error).message}`);
            }
        }
    }

    private async _appendLog(filePath: string, text: string): Promise<void> {
        try {
            await fs.appendFile(filePath, `${text}\n`);
        } catch (err) {
            console.error(`Failed to write to ${filePath}. Ensure the log folder exists.`);
        }
    }

    private async _readLog(filePath: string, date?: string): Promise<string> {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            if (date) {
                return data.split('\n').filter(line => line.includes(date)).join('\n');
            }
            return data;
        } catch (err) {
            console.error(`Failed to read from ${filePath}. Ensure the log folder exists.`);
            return '';
        }
    }

    private _setupBackup(): void {
        const timeout = this.backup!.time;
        setInterval(async () => {
            await this._performBackup();
        }, timeout);
    }

    private async _performBackup(): Promise<void> {
        const backupDir = this.backup!.path || path.join(this.logDir, 'backup');
        try {
            await fs.mkdir(backupDir, { recursive: true });
            const files = await fs.readdir(this.logDir);
            const logFiles = files.filter(file => file.endsWith('.log'));
            for (const file of logFiles) {
                const srcPath = path.join(this.logDir, file);
                const destPath = path.join(backupDir, `${file}.${Date.now()}`);
                await fs.copyFile(srcPath, destPath);
            }
            console.info('Logs have been backed up successfully.');
        } catch (err) {
            console.error(`Failed to perform backup: ${(err as Error).message}`);
        }
    }

    private _setupAutoClear(): void {
        const timeout = this.clearLogs!.time;

        setInterval(async () => {
            await this._clearLogs();
        }, timeout);
    }

    private async _clearLogs(): Promise<void> {
        const whiteList = this.clearLogs!.whiteList || [];
        const files = await fs.readdir(this.logDir);
        const logFiles = files.filter(file => file.endsWith('.log'));
        for (const file of logFiles) {
            const level = file.split('.')[0] as LogLevel;
            if (!whiteList.includes(level)) {
                const filePath = path.join(this.logDir, file);
                await fs.writeFile(filePath, '');
            }
        }
    }

    private async _sendToExternalLog(level: LogLevel, message: string): Promise<void> {
        if (!this.externalLog) return;

        try {
            await axios.post(this.externalLog.url, {
                level,
                message
            }, {
                headers: this.externalLog.headers
            });
        } catch (err) {
            console.error(`Failed to send log to external stack: ${(err as Error).message}`);
        }
    }
}

export default Logger;
