"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = require("path");
class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || 'log';
        this.format = options.format || 'plain';
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
        this.environment = options.environment || 'development';
    }
    async error(text) {
        await this._log('error', text);
    }
    async info(text) {
        await this._log('info', text);
    }
    async debug(text) {
        await this._log('debug', text);
    }
    async warn(text) {
        await this._log('warn', text);
    }
    async log(text) {
        await this._log('log', text);
    }
    async getLogs(level, date) {
        return await this._readLog(this._getFilePath(level), date);
    }
    async _log(level, text) {
        if (this.environment === 'production' && level === 'debug') {
            return; // Skip debug logs in production
        }
        const filePath = this._getFilePath(level);
        const formattedText = this._formatLog(level, text);
        console[level](formattedText);
        await this._rotateLogIfNeeded(filePath);
        await this._appendLog(filePath, formattedText);
    }
    _getFilePath(level) {
        return path.join(this.logDir, `${level}.log`);
    }
    _formatLog(level, text) {
        const timestamp = new Date().toISOString();
        if (this.format === 'json') {
            return JSON.stringify({ timestamp, level, message: text });
        }
        return `${timestamp} - ${level.toUpperCase()}: ${text}`;
    }
    async _rotateLogIfNeeded(filePath) {
        try {
            const stats = await fs_1.promises.stat(filePath);
            if (stats.size >= this.maxFileSize) {
                const newPath = `${filePath}.${Date.now()}`;
                await fs_1.promises.rename(filePath, newPath);
            }
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Failed to check log file size: ${err.message}`);
            }
        }
    }
    async _appendLog(filePath, text) {
        try {
            await fs_1.promises.appendFile(filePath, `${text}\n`);
        }
        catch (err) {
            console.error(`Failed to write to ${filePath}. Ensure the log folder exists.`);
        }
    }
    async _readLog(filePath, date) {
        try {
            const data = await fs_1.promises.readFile(filePath, 'utf8');
            if (date) {
                return data.split('\n').filter(line => line.includes(date)).join('\n');
            }
            return data;
        }
        catch (err) {
            console.error(`Failed to read from ${filePath}. Ensure the log folder exists.`);
            return '';
        }
    }
}
exports.default = Logger;
