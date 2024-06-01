interface LoggerOptions {
    logDir?: string;
    format?: 'plain' | 'json';
    maxFileSize?: number;
    environment?: 'development' | 'production';
}

declare class Logger {
    constructor(options?: LoggerOptions);
    error(text: string): Promise<void>;
    info(text: string): Promise<void>;
    debug(text: string): Promise<void>;
    warn(text: string): Promise<void>;
    log(text: string): Promise<void>;
    getLogs(level: string, date?: string): Promise<string>;
}

export default Logger;