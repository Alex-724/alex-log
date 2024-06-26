import Logger from '../Logger/Logger.js';

const logger = new Logger({
  logDir: 'logs',
  format: 'plain', // 'plain' or 'json'
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  environment: 'development' // 'development' or 'production'
});

async function testLogger() {
  await logger.info('This is an info log');
  await logger.error('This is an error log');
  await logger.debug('This is a debug log');
  await logger.warn('This is a warning log');
  await logger.log('This is a general log');

  const infoLogs = await logger.getLogs('info');
  console.log('Info Logs:', infoLogs);

  const errorLogs = await logger.getLogs('error');
  console.log('Error Logs:', errorLogs);
}

testLogger().catch(console.error);
