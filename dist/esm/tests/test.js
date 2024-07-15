var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Logger from '../src/Logger/Logger.js';
function testLogger() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new Logger({
            logDir: 'logs',
            format: 'plain',
            maxFileSize: 5 * 1024 * 1024,
            environment: 'development'
        });
        yield logger.info('This is an info log');
        yield logger.error('This is an error log');
        yield logger.debug('This is a debug log');
        yield logger.warn('This is a warning log');
        yield logger.log('This is a general log');
        const infoLogs = yield logger.getLogs('info');
        console.log('Info Logs:', infoLogs);
        const errorLogs = yield logger.getLogs('error');
        console.log('Error Logs:', errorLogs);
    });
}
function testBackupAndClearLog() {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new Logger({
            logDir: 'logs',
            backup: {
                time: 30 * 1000,
                path: 'backup_logs'
            },
            clearLogs: {
                time: 31 * 1000,
                whiteList: ['error']
            }
        });
        const testInterval = setInterval((index) => __awaiter(this, void 0, void 0, function* () {
            yield logger.info('This is an info log' + index);
            yield logger.error('This is an error log' + index);
            yield logger.debug('This is a debug log' + index);
            yield logger.warn('This is a warning log' + index);
            yield logger.log('This is a general log' + index);
        }), 2000);
        setTimeout(() => {
            clearInterval(testInterval);
        }, 60 * 1000);
    });
}
testLogger().catch(console.error);
testBackupAndClearLog().catch(console.error);
