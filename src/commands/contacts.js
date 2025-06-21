import chalk from 'chalk';
import client from '../api/client.js';
import { formatOutput, columnConfigs } from '../utils/output.js';

export function contactCommands(program) {
  const contacts = program
    .command('contacts')
    .alias('contact')
    .description('Manage contacts');

  // List contacts
  contacts
    .command('list')
    .description('List all contacts')
    .option('-l, --limit <number>', 'limit number of results', '50')
    .option('-a, --all', 'fetch all contacts (ignore limit)')
    .action(async (options) => {
      try {
        const parentOptions = contacts.parent.opts();
        const format = options.format || parentOptions.format || 'table';
        
        let data;
        if (options.all) {
          console.log(chalk.yellow('Fetching all contacts... This may take a while.'));
          data = await client.getAllPages('/contacts');
        } else {
          const response = await client.get('/contacts', { per_page: options.limit });
          data = response.data;
        }

        console.log(chalk.green(`Found ${data.length} contacts\n`));
        formatOutput(data, format, columnConfigs.contacts);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Get contact
  contacts
    .command('get <id>')
    .description('Get contact by ID')
    .action(async (id) => {
      try {
        const parentOptions = contacts.parent.opts();
        const format = parentOptions.format || 'table';
        
        const contact = await client.get(`/contacts/${id}`);
        formatOutput(contact, format, columnConfigs.contacts);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Create contact
  contacts
    .command('create')
    .description('Create a new contact')
    .option('-e, --email <email>', 'contact email')
    .option('-n, --name <name>', 'contact name')
    .option('-p, --phone <phone>', 'phone number')
    .option('-r, --role <role>', 'contact role (user or lead)', 'user')
    .option('--custom <json>', 'custom attributes as JSON')
    .action(async (options) => {
      try {
        const contactData = {
          role: options.role
        };

        if (options.email) contactData.email = options.email;
        if (options.name) contactData.name = options.name;
        if (options.phone) contactData.phone = options.phone;

        if (options.custom) {
          try {
            contactData.custom_attributes = JSON.parse(options.custom);
          } catch (e) {
            console.error(chalk.red('Error:'), 'Invalid JSON for custom attributes');
            process.exit(1);
          }
        }

        const contact = await client.post('/contacts', contactData);
        console.log(chalk.green('✓'), 'Contact created successfully');
        
        const parentOptions = contacts.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(contact, format, columnConfigs.contacts);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Update contact
  contacts
    .command('update <id>')
    .description('Update a contact')
    .option('-e, --email <email>', 'contact email')
    .option('-n, --name <name>', 'contact name')
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

        const contact = await client.put(`/contacts/${id}`, updateData);
        console.log(chalk.green('✓'), 'Contact updated successfully');
        
        const parentOptions = contacts.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(contact, format, columnConfigs.contacts);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Delete contact
  contacts
    .command('delete <id>')
    .description('Delete a contact permanently')
    .option('--force', 'skip confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow('⚠'), 'This will permanently delete the contact.');
          console.log('Use --force to skip this confirmation.');
          process.exit(0);
        }

        await client.delete(`/contacts/${id}`);
        console.log(chalk.green('✓'), 'Contact deleted successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Search contacts
  contacts
    .command('search <query>')
    .description('Search contacts by email')
    .action(async (query) => {
      try {
        const parentOptions = contacts.parent.opts();
        const format = parentOptions.format || 'table';
        
        const searchQuery = {
          query: {
            field: 'email',
            operator: '~',
            value: query
          }
        };

        const response = await client.post('/contacts/search', searchQuery);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} contacts\n`));
        formatOutput(data, format, columnConfigs.contacts);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Convert contact to user
  contacts
    .command('convert <id>')
    .description('Convert a contact to a user')
    .option('-e, --email <email>', 'user email (required if contact has no email)')
    .action(async (id, options) => {
      try {
        const convertData = {
          contact: { id },
          user: {}
        };

        if (options.email) {
          convertData.user.email = options.email;
        }

        const user = await client.post('/contacts/convert', convertData);
        console.log(chalk.green('✓'), 'Contact converted to user successfully');
        
        const parentOptions = contacts.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(user, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });
}