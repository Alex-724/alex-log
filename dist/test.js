"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("./Logger"));
const logger = new Logger_1.default({
    logDir: 'logs',
    format: 'plain',
    maxFileSize: 5 * 1024 * 1024,
    environment: 'development' // 'development' or 'production'
});
function testLogger() {
    return __awaiter(this, void 0, void 0, function* () {
        yield logger.info('This is an info log');
        yield logger.error('This is an error log');
        yield logger.debug('This is a debug log');
        yield logger.warn('This is a warning log');
        yield logger.log('This is a general log');
    });
}
testLogger().catch(console.error);
