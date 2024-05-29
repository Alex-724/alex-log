import { packageDirectory } from 'pkg-dir';
import { execSync } from 'child_process';
import chalk from 'chalk';

async function getVersion() {
    const dir = await packageDirectory();
    const versionPath = `file://${dir}/package.json`;
    const { version } = await import(versionPath);
    return version;
}

export const checkForUpdate = async function() {
    const downloadedVersion = await getVersion();
    const getLatestVersion = execSync('npm show alex-log version').toString();
    if (downloadedVersion < getLatestVersion) {
        console.log(chalk.red(`[Alex-Log]`) + ` New Version Available: ${getLatestVersion} Run 'npm i alex-log@latest' to update`);
    };
}