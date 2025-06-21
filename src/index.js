#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { userCommands } from './commands/users.js';
import { contactCommands } from './commands/contacts.js';
import { conversationCommands } from './commands/conversations.js';
import { companyCommands } from './commands/companies.js';
import { articleCommands } from './commands/articles.js';
import { authCommands } from './commands/auth.js';

dotenv.config();

const program = new Command();

program
  .name('intercom')
  .description('CLI tool for Intercom API')
  .version('1.0.0')
  .option('-f, --format <format>', 'output format (json, table, csv)', 'table')
  .option('-e, --env <environment>', 'environment to use', 'production');

// Add commands
authCommands(program);
userCommands(program);
contactCommands(program);
conversationCommands(program);
companyCommands(program);
articleCommands(program);

// Global error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
}