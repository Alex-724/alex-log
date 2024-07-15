'use strict';

var fs = require('fs');
var path = require('path');
var axios = require('axios');
var pkgDir = require('pkg-dir');
var child_process = require('child_process');
var chalk = require('chalk');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Logger {
    constructor(options = {}) {
        this.logDir = options.logDir || 'log';
        this.format = options.format || 'plain';
        this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024;
        this.environment = options.environment || 'development';
        this.backup = options.backup;
        this.clearLogs = options.clearLogs;
        this.externalLog = options.externalLog;
        this.backupInterval = undefined;
        this.logsInterval = undefined;
        this.error = this.error.bind(this);
        this.info = this.info.bind(this);
        this.debug = this.debug.bind(this);
        this.warn = this.warn.bind(this);
        this.log = this.log.bind(this);
        this.getLogs = this.getLogs.bind(this);
        this.stopBackup = this.stopBackup.bind(this);
        this.stopClearLogs = this.stopClearLogs.bind(this);
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
        if (this.backup) {
            this._setupBackup();
        }
        if (this.clearLogs) {
            this._setupAutoClear();
        }
    }
    error(text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield this._log('error', text);
        });
    }
    info(text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield this._log('info', text);
        });
    }
    debug(text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield this._log('debug', text);
        });
    }
    warn(text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield this._log('warn', text);
        });
    }
    log(text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield this._log('log', text);
        });
    }
    getLogs(level, date) {
        return __awaiter$1(this, void 0, void 0, function* () {
            return yield this._readLog(this._getFilePath(level), date);
        });
    }
    stopBackup() {
        if (this.backupInterval !== undefined) {
            clearInterval(this.backupInterval);
            return true;
        }
        return false;
    }
    stopClearLogs() {
        if (this.logsInterval !== undefined) {
            clearInterval(this.logsInterval);
            return true;
        }
        return false;
    }
    _log(level, text) {
        return __awaiter$1(this, void 0, void 0, function* () {
            if (this.environment === 'production' && level === 'debug') {
                return;
            }
            const filePath = this._getFilePath(level);
            const formattedText = this._formatLog(level, text);
            console[level](formattedText);
            yield this._rotateLogIfNeeded(filePath);
            yield this._appendLog(filePath, formattedText);
            if (this.externalLog) {
                yield this._sendToExternalLog(level, formattedText);
            }
        });
    }
    _getFilePath(level) {
        return path__namespace.join(this.logDir, `${level}.log`);
    }
    _formatLog(level, text) {
        const timestamp = new Date().toISOString();
        if (this.format === 'json') {
            return JSON.stringify({ timestamp, level, message: text });
        }
        return `${timestamp} - ${level.toUpperCase()}: ${text}`;
    }
    _rotateLogIfNeeded(filePath) {
        return __awaiter$1(this, void 0, void 0, function* () {
            try {
                const stats = yield fs.promises.stat(filePath);
                if (stats.size >= this.maxFileSize) {
                    const newPath = `${filePath}.${Date.now()}`;
                    yield fs.promises.rename(filePath, newPath);
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
        return __awaiter$1(this, void 0, void 0, function* () {
            try {
                yield fs.promises.appendFile(filePath, `${text}\n`);
            }
            catch (err) {
                console.error(`Failed to write to ${filePath}. Ensure the log folder exists.`);
            }
        });
    }
    _readLog(filePath, date) {
        return __awaiter$1(this, void 0, void 0, function* () {
            try {
                const data = yield fs.promises.readFile(filePath, 'utf8');
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
    _setupBackup() {
        const timeout = this.backup.time;
        this.backupInterval = setInterval(() => __awaiter$1(this, void 0, void 0, function* () {
            yield this._performBackup();
        }), timeout);
    }
    _performBackup() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const backupDir = this.backup.path || path__namespace.join(this.logDir, 'backup');
            try {
                yield fs.promises.mkdir(backupDir, { recursive: true });
                const files = yield fs.promises.readdir(this.logDir);
                const logFiles = files.filter(file => file.endsWith('.log'));
                for (const file of logFiles) {
                    const srcPath = path__namespace.join(this.logDir, file);
                    const destPath = path__namespace.join(backupDir, `${file}.${Date.now()}`);
                    yield fs.promises.copyFile(srcPath, destPath);
                }
                console.info('Logs have been backed up successfully.');
            }
            catch (err) {
                console.error(`Failed to perform backup: ${err.message}`);
            }
        });
    }
    _setupAutoClear() {
        const timeout = this.clearLogs.time;
        this.logsInterval = setInterval(() => __awaiter$1(this, void 0, void 0, function* () {
            yield this._clearLogs();
        }), timeout);
    }
    _clearLogs() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const whiteList = this.clearLogs.whiteList || [];
            const files = yield fs.promises.readdir(this.logDir);
            const logFiles = files.filter(file => file.endsWith('.log'));
            for (const file of logFiles) {
                const level = file.split('.')[0];
                if (!whiteList.includes(level)) {
                    const filePath = path__namespace.join(this.logDir, file);
                    yield fs.promises.writeFile(filePath, '');
                }
            }
        });
    }
    _sendToExternalLog(level, message) {
        return __awaiter$1(this, void 0, void 0, function* () {
            if (!this.externalLog)
                return;
            try {
                yield axios.post(this.externalLog.url, {
                    level,
                    message
                }, {
                    headers: this.externalLog.headers
                });
            }
            catch (err) {
                console.error(`Failed to send log to external stack: ${err.message}`);
            }
        });
    }
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = yield pkgDir.packageDirectory();
        const versionPath = `file://${dir}/package.json`;
        const { version } = yield import(versionPath);
        return version;
    });
}
const checkForUpdate = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const downloadedVersion = yield getVersion();
        const getLatestVersion = child_process.execSync('npm show alex-log version').toString();
        if (downloadedVersion < getLatestVersion) {
            console.log(chalk.red(`[Alex-Log]`) + ` New Version Available: ${getLatestVersion} Run 'npm i alex-log@latest' to update`);
        }
    });
};

checkForUpdate();

exports.Logger = Logger;
