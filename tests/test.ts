import Logger from '../src/Logger/Logger.js';



async function testLogger() {
  const logger = new Logger({
    logDir: 'logs',
    format: 'plain', // 'plain' or 'json'
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    environment: 'development' // 'development' or 'production'
  });
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

async function testBackupAndClearLog() {
  const logger = new Logger({
    logDir: 'logs',
    backup: {
      time: 30 * 1000,
      path: 'backup_logs'
    },
    clearLogs: {
      time: 31 * 1000, // 7 days in milliseconds
      whiteList: ['error'] // Only keep error logs
    }
  });

  const testInterval = setInterval(async (index) => {
    await logger.info('This is an info log' + index);
    await logger.error('This is an error log' + index);
    await logger.debug('This is a debug log' + index);
    await logger.warn('This is a warning log' + index);
    await logger.log('This is a general log' + index);
  }, 2000)

  setTimeout(()=> {
    clearInterval(testInterval)
  }, 60 * 1000);
}


testLogger().catch(console.error);
testBackupAndClearLog().catch(console.error)
