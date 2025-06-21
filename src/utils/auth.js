import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const CONFIG_DIR = path.join(os.homedir(), '.intercom-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create config directory: ${error.message}`);
  }
}

export async function getToken() {
  // First, check environment variable
  if (process.env.INTERCOM_ACCESS_TOKEN) {
    return process.env.INTERCOM_ACCESS_TOKEN;
  }

  // Then, check config file
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(configData);
    return config.accessToken;
  } catch (error) {
    return null;
  }
}

export async function saveToken(token) {
  await ensureConfigDir();
  
  const config = {
    accessToken: token,
    updatedAt: new Date().toISOString()
  };

  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(chalk.green('✓'), 'Access token saved successfully');
  } catch (error) {
    throw new Error(`Failed to save token: ${error.message}`);
  }
}

export async function removeToken() {
  try {
    await fs.unlink(CONFIG_FILE);
    console.log(chalk.green('✓'), 'Access token removed successfully');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new Error(`Failed to remove token: ${error.message}`);
    }
    console.log(chalk.yellow('!'), 'No token found to remove');
  }
}

export async function validateToken() {
  const token = await getToken();
  
  if (!token) {
    console.error(chalk.red('Error:'), 'No access token found');
    console.log('\nTo set up authentication, run:');
    console.log(chalk.cyan('  intercom auth set-token <your-access-token>'));
    console.log('\nOr set the INTERCOM_ACCESS_TOKEN environment variable');
    process.exit(1);
  }
  
  return token;
}