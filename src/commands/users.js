import chalk from 'chalk';
import client from '../api/client.js';
import { formatOutput, columnConfigs } from '../utils/output.js';

export function userCommands(program) {
  const users = program
    .command('users')
    .alias('user')
    .description('Manage users');

  // List users
  users
    .command('list')
    .description('List all users')
    .option('-l, --limit <number>', 'limit number of results', '50')
    .option('-a, --all', 'fetch all users (ignore limit)')
    .action(async (options) => {
      try {
        const parentOptions = users.parent.opts();
        const format = options.format || parentOptions.format || 'table';
        
        let data;
        if (options.all) {
          console.log(chalk.yellow('Fetching all users... This may take a while.'));
          data = await client.getAllPages('/users');
        } else {
          const response = await client.get('/users', { per_page: options.limit });
          data = response.data;
        }

        console.log(chalk.green(`Found ${data.length} users\n`));
        formatOutput(data, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Get user by ID or email
  users
    .command('get <idOrEmail>')
    .description('Get user by ID or email')
    .action(async (idOrEmail) => {
      try {
        const parentOptions = users.parent.opts();
        const format = parentOptions.format || 'table';
        
        let endpoint;
        if (idOrEmail.includes('@')) {
          endpoint = `/users?email=${encodeURIComponent(idOrEmail)}`;
        } else {
          endpoint = `/users/${idOrEmail}`;
        }

        const data = await client.get(endpoint);
        
        // If searching by email, the response is an array
        const user = data.data ? data.data[0] : data;
        
        if (!user) {
          console.log(chalk.yellow('User not found'));
          return;
        }

        formatOutput(user, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Create user
  users
    .command('create')
    .description('Create a new user')
    .requiredOption('-e, --email <email>', 'user email')
    .option('-n, --name <name>', 'user name')
    .option('-p, --phone <phone>', 'phone number')
    .option('-c, --company-id <id>', 'company ID')
    .option('--custom <json>', 'custom attributes as JSON')
    .action(async (options) => {
      try {
        const userData = {
          email: options.email,
          name: options.name,
          phone: options.phone
        };

        if (options.companyId) {
          userData.companies = [{ company_id: options.companyId }];
        }

        if (options.custom) {
          try {
            userData.custom_attributes = JSON.parse(options.custom);
          } catch (e) {
            console.error(chalk.red('Error:'), 'Invalid JSON for custom attributes');
            process.exit(1);
          }
        }

        const user = await client.post('/users', userData);
        console.log(chalk.green('✓'), 'User created successfully');
        
        const parentOptions = users.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(user, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Update user
  users
    .command('update <id>')
    .description('Update a user')
    .option('-e, --email <email>', 'user email')
    .option('-n, --name <name>', 'user name')
    .option('-p, --phone <phone>', 'phone number')
    .option('--custom <json>', 'custom attributes as JSON')
    .action(async (id, options) => {
      try {
        const updateData = { id };
        
        if (options.email) updateData.email = options.email;
        if (options.name) updateData.name = options.name;
        if (options.phone) updateData.phone = options.phone;
        
        if (options.custom) {
          try {
            updateData.custom_attributes = JSON.parse(options.custom);
          } catch (e) {
            console.error(chalk.red('Error:'), 'Invalid JSON for custom attributes');
            process.exit(1);
          }
        }

        const user = await client.put(`/users/${id}`, updateData);
        console.log(chalk.green('✓'), 'User updated successfully');
        
        const parentOptions = users.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(user, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Delete user
  users
    .command('delete <id>')
    .description('Delete a user permanently')
    .option('--force', 'skip confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow('⚠'), 'This will permanently delete the user.');
          console.log('Use --force to skip this confirmation.');
          process.exit(0);
        }

        await client.delete(`/users/${id}`);
        console.log(chalk.green('✓'), 'User deleted successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Search users
  users
    .command('search <query>')
    .description('Search users')
    .action(async (query) => {
      try {
        const parentOptions = users.parent.opts();
        const format = parentOptions.format || 'table';
        
        const searchQuery = {
          query: {
            field: 'email',
            operator: '~',
            value: query
          }
        };

        const response = await client.post('/search', searchQuery);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} users\n`));
        formatOutput(data, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });
}