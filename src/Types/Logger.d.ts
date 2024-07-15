type LogLevel = 'error' | 'info' | 'debug' | 'warn' | 'log';

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

interface LoggerOptions {
    logDir?: string;
    format?: 'plain' | 'json';
    maxFileSize?: number;
    environment?: 'development' | 'production';
    backup?: BackupOptions;
    clearLogs?: ClearLogsOptions;
    externalLog?: ExternalLogOptions;
}

declare class Logger {
    constructor(options?: LoggerOptions);
    error(text: string): Promise<void>;
    info(text: string): Promise<void>;
    debug(text: string): Promise<void>;
    warn(text: string): Promise<void>;
    log(text: string): Promise<void>;
    getLogs(level: LogLevel, date?: string): Promise<string>;
}

export default Logger;