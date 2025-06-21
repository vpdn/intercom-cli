import chalk from 'chalk';
import { saveToken, removeToken, getToken } from '../utils/auth.js';

export function authCommands(program) {
  const auth = program
    .command('auth')
    .description('Manage authentication');

  auth
    .command('set-token <token>')
    .description('Set your Intercom access token')
    .action(async (token) => {
      try {
        await saveToken(token);
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  auth
    .command('remove-token')
    .description('Remove stored access token')
    .action(async () => {
      try {
        await removeToken();
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });

  auth
    .command('status')
    .description('Check authentication status')
    .action(async () => {
      try {
        const token = await getToken();
        if (token) {
          console.log(chalk.green('✓'), 'Access token is configured');
          console.log(chalk.gray('Token:'), token.substring(0, 10) + '...' + token.substring(token.length - 10));
        } else {
          console.log(chalk.yellow('!'), 'No access token configured');
          console.log('\nTo set up authentication, run:');
          console.log(chalk.cyan('  intercom auth set-token <your-access-token>'));
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}