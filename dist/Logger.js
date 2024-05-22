"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path = __importStar(require("path"));
class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || 'log';
        this.format = options.format || 'plain';
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5 MB
        this.environment = options.environment || 'development';
    }
    error(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._log('error', text);
        });
    }
    info(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._log('info', text);
        });
    }
    debug(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._log('debug', text);
        });
    }
    warn(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._log('warn', text);
        });
    }
    log(text) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._log('log', text);
        });
    }
    getLogs(level, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._readLog(this._getFilePath(level), date);
        });
    }
    _log(level, text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.environment === 'production' && level === 'debug') {
                return; // Skip debug logs in production
            }
            const filePath = this._getFilePath(level);
            const formattedText = this._formatLog(level, text);
            console[level](formattedText);
            yield this._rotateLogIfNeeded(filePath);
            yield this._appendLog(filePath, formattedText);
        });
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
    _rotateLogIfNeeded(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield fs_1.promises.stat(filePath);
                if (stats.size >= this.maxFileSize) {
                    const newPath = `${filePath}.${Date.now()}`;
                    yield fs_1.promises.rename(filePath, newPath);
                }
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`Failed to check log file size: ${err.message}`);
                }
            }
        });
    }
    _appendLog(filePath, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs_1.promises.appendFile(filePath, `${text}\n`);
            }
            catch (err) {
                console.error(`Failed to write to ${filePath}. Ensure the log folder exists.`);
            }
        });
    }
    _readLog(filePath, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fs_1.promises.readFile(filePath, 'utf8');
                if (date) {
                    return data.split('\n').filter(line => line.includes(date)).join('\n');
                }
                return data;
            }
            catch (err) {
                console.error(`Failed to read from ${filePath}. Ensure the log folder exists.`);
                return '';
            }
        });
    }
}
exports.default = Logger;
