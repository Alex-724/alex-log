# alex-log

A flexible and configurable logging library for Node.js with TypeScript support.

## Installation

To install `alex-log`, use npm or yarn:

```sh
npm install alex-log
# or
yarn add alex-log
```

## Features

- Customizable log levels: `error`, `info`, `debug`, `warn`, and `log`.
- Supports different log formats: plain text and JSON.
- Log rotation to manage log file sizes.
- Environment-based logging behavior.
- Log backup and auto-clear options.
- External log stack integration (e.g., Kibana).
- TypeScript support for type safety and autocompletion.

## Usage

### Basic Usage

```typescript
import Logger from 'alex-log';

const logger = new Logger({
  logDir: 'logs',
  format: 'plain', // 'plain' or 'json'
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  environment: 'development' // 'development' or 'production'
});

logger.info('This is an info log');
logger.error('This is an error log');
logger.debug('This is a debug log');
logger.warn('This is a warning log');
logger.log('This is a general log');
```

### Advanced Usage

#### Backup and Auto-Clear

```typescript
const logger = new Logger({
  logDir: 'logs',
  backup: {
    time: 86400000, // 24 hours in milliseconds
    path: 'backup_logs'
  },
  clearLogs: {
    time: 604800000, // 7 days in milliseconds
    whiteList: ['error'] // Only keep error logs
  }
});
```

#### External Log Stack Integration

```typescript
const logger = new Logger({
  logDir: 'logs',
  externalLog: {
    url: 'https://log-server.example.com/logs',
    headers: {
      Authorization: 'Bearer your-api-key'
    }
  }
});
```

### Configuration Options

- **logDir**: Directory to store log files. Default is `log`.
- **format**: Log format. Options are `plain` or `json`. Default is `plain`.
- **maxFileSize**: Maximum file size for log rotation. Default is 5 MB.
- **environment**: Environment type. Options are `development` or `production`. Default is `development`.
- **backup**: Backup options with `time` (required) and `path` (optional).
- **clearLogs**: Auto-clear logs with `time` (required) and `whiteList` (optional).
- **externalLog**: External log stack integration with `url` (required) and `headers` (optional).

### Reading Logs

You can read logs by date:

```typescript
const logs = await logger.getLogs('info', '2024-05-22');
console.log(logs);
```

## License

This project is licensed under the ISC License.