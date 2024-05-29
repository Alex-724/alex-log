import { promises as fs } from 'fs';
import * as path from 'path';

interface LoggerOptions {
    logDir?: string;
    format?: 'plain' | 'json';
    maxFileSize?: number;
    environment?: 'development' | 'production';
}

type LogLevel = 'error' | 'info' | 'debug' | 'warn' | 'log';

class Logger {
    private logDir: string;
    private format: 'plain' | 'json';
    private maxFileSize: number;
    private environment: 'development' | 'production';

    constructor(options: LoggerOptions = {}) {
        this.logDir = options.logDir || 'log';
        this.format = options.format || 'plain';
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
        this.environment = options.environment || 'development';
        
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
}

export default Logger;
