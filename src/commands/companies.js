import chalk from 'chalk';
import client from '../api/client.js';
import { formatOutput, columnConfigs } from '../utils/output.js';

export function companyCommands(program) {
  const companies = program
    .command('companies')
    .alias('company')
    .description('Manage companies');

  // List companies
  companies
    .command('list')
    .description('List all companies')
    .option('-l, --limit <number>', 'limit number of results', '50')
    .option('-a, --all', 'fetch all companies (ignore limit)')
    .action(async (options) => {
      try {
        const parentOptions = companies.parent.opts();
        const format = options.format || parentOptions.format || 'table';
        
        let data;
        if (options.all) {
          console.log(chalk.yellow('Fetching all companies... This may take a while.'));
          data = await client.getAllPages('/companies');
        } else {
          const response = await client.get('/companies', { per_page: options.limit });
          data = response.data;
        }

        console.log(chalk.green(`Found ${data.length} companies\n`));
        formatOutput(data, format, columnConfigs.companies);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Get company
  companies
    .command('get <id>')
    .description('Get company by ID')
    .action(async (id) => {
      try {
        const parentOptions = companies.parent.opts();
        const format = parentOptions.format || 'table';
        
        const company = await client.get(`/companies/${id}`);
        formatOutput(company, format, columnConfigs.companies);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Create company
  companies
    .command('create')
    .description('Create a new company')
    .requiredOption('-i, --id <id>', 'company ID (your internal ID)')
    .requiredOption('-n, --name <name>', 'company name')
    .option('-p, --plan <plan>', 'company plan')
    .option('-s, --size <size>', 'company size (number of employees)')
    .option('-w, --website <url>', 'company website')
    .option('-ind, --industry <industry>', 'company industry')
    .option('--custom <json>', 'custom attributes as JSON')
    .action(async (options) => {
      try {
        const companyData = {
          company_id: options.id,
          name: options.name
        };

        if (options.plan) companyData.plan = options.plan;
        if (options.size) companyData.size = parseInt(options.size);
        if (options.website) companyData.website = options.website;
        if (options.industry) companyData.industry = options.industry;

        if (options.custom) {
          try {
            companyData.custom_attributes = JSON.parse(options.custom);
          } catch (e) {
            console.error(chalk.red('Error:'), 'Invalid JSON for custom attributes');
            process.exit(1);
          }
        }

        const company = await client.post('/companies', companyData);
        console.log(chalk.green('✓'), 'Company created successfully');
        
        const parentOptions = companies.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(company, format, columnConfigs.companies);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Update company
  companies
    .command('update <id>')
    .description('Update a company')
    .option('-n, --name <name>', 'company name')
    .option('-p, --plan <plan>', 'company plan')
    .option('-s, --size <size>', 'company size')
    .option('-w, --website <url>', 'company website')
    .option('-ind, --industry <industry>', 'company industry')
    .option('--custom <json>', 'custom attributes as JSON')
    .action(async (id, options) => {
      try {
        const updateData = { id };
        
        if (options.name) updateData.name = options.name;
        if (options.plan) updateData.plan = options.plan;
        if (options.size) updateData.size = parseInt(options.size);
        if (options.website) updateData.website = options.website;
        if (options.industry) updateData.industry = options.industry;
        
        if (options.custom) {
          try {
            updateData.custom_attributes = JSON.parse(options.custom);
          } catch (e) {
            console.error(chalk.red('Error:'), 'Invalid JSON for custom attributes');
            process.exit(1);
          }
        }

        const company = await client.put(`/companies/${id}`, updateData);
        console.log(chalk.green('✓'), 'Company updated successfully');
        
        const parentOptions = companies.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(company, format, columnConfigs.companies);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Delete company
  companies
    .command('delete <id>')
    .description('Delete a company permanently')
    .option('--force', 'skip confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow('⚠'), 'This will permanently delete the company.');
          console.log('Use --force to skip this confirmation.');
          process.exit(0);
        }

        await client.delete(`/companies/${id}`);
        console.log(chalk.green('✓'), 'Company deleted successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // List company users
  companies
    .command('users <id>')
    .description('List users in a company')
    .action(async (id) => {
      try {
        const parentOptions = companies.parent.opts();
        const format = parentOptions.format || 'table';
        
        const response = await client.get(`/companies/${id}/users`);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} users in company\n`));
        formatOutput(data, format, columnConfigs.users);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Attach user to company
  companies
    .command('attach-user <companyId> <userId>')
    .description('Attach a user to a company')
    .action(async (companyId, userId) => {
      try {
        await client.post(`/users/${userId}/companies`, {
          id: companyId
        });
        console.log(chalk.green('✓'), 'User attached to company successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Detach user from company
  companies
    .command('detach-user <companyId> <userId>')
    .description('Detach a user from a company')
    .action(async (companyId, userId) => {
      try {
        await client.delete(`/users/${userId}/companies/${companyId}`);
        console.log(chalk.green('✓'), 'User detached from company successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Search companies
  companies
    .command('search <query>')
    .description('Search companies by name')
    .action(async (query) => {
      try {
        const parentOptions = companies.parent.opts();
        const format = parentOptions.format || 'table';
        
        const searchQuery = {
          query: {
            field: 'name',
            operator: '~',
            value: query
          }
        };

        const response = await client.post('/companies/search', searchQuery);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} companies\n`));
        formatOutput(data, format, columnConfigs.companies);
      } catch (error) {
        // Error is handled in the client
      }
    });
}