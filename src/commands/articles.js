import chalk from 'chalk';
import client from '../api/client.js';
import { formatOutput, columnConfigs } from '../utils/output.js';

export function articleCommands(program) {
  const articles = program
    .command('articles')
    .alias('article')
    .description('Manage help center articles');

  // List articles
  articles
    .command('list')
    .description('List all articles')
    .option('-l, --limit <number>', 'limit number of results', '50')
    .option('-s, --state <state>', 'filter by state (published, draft)')
    .action(async (options) => {
      try {
        const parentOptions = articles.parent.opts();
        const format = options.format || parentOptions.format || 'table';
        
        const params = { per_page: options.limit };
        if (options.state) params.state = options.state;

        const response = await client.get('/articles', params);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} articles\n`));
        formatOutput(data, format, columnConfigs.articles);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Get article
  articles
    .command('get <id>')
    .description('Get article by ID')
    .action(async (id) => {
      try {
        const parentOptions = articles.parent.opts();
        const format = parentOptions.format || 'table';
        
        const article = await client.get(`/articles/${id}`);
        
        if (format === 'json') {
          formatOutput(article, format);
        } else {
          formatOutput(article, format, columnConfigs.articles);
          
          // Show article content
          console.log(chalk.cyan('\nArticle Content:'));
          console.log(chalk.gray('─'.repeat(60)));
          console.log(chalk.bold('Title:'), article.title);
          console.log(chalk.bold('Description:'), article.description || 'No description');
          console.log(chalk.gray('─'.repeat(60)));
          console.log(article.body || 'No content');
        }
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Create article
  articles
    .command('create')
    .description('Create a new article')
    .requiredOption('-t, --title <title>', 'article title')
    .requiredOption('-a, --author <id>', 'author ID')
    .option('-d, --description <description>', 'article description')
    .option('-b, --body <body>', 'article body content')
    .option('-s, --state <state>', 'article state (published, draft)', 'draft')
    .option('-p, --parent <id>', 'parent collection ID')
    .action(async (options) => {
      try {
        const articleData = {
          title: options.title,
          author_id: parseInt(options.author),
          state: options.state
        };

        if (options.description) articleData.description = options.description;
        if (options.body) articleData.body = options.body;
        if (options.parent) articleData.parent_id = parseInt(options.parent);

        const article = await client.post('/articles', articleData);
        console.log(chalk.green('✓'), 'Article created successfully');
        
        const parentOptions = articles.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(article, format, columnConfigs.articles);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Update article
  articles
    .command('update <id>')
    .description('Update an article')
    .option('-t, --title <title>', 'article title')
    .option('-d, --description <description>', 'article description')
    .option('-b, --body <body>', 'article body content')
    .option('-s, --state <state>', 'article state (published, draft)')
    .option('-p, --parent <id>', 'parent collection ID')
    .action(async (id, options) => {
      try {
        const updateData = {};
        
        if (options.title) updateData.title = options.title;
        if (options.description) updateData.description = options.description;
        if (options.body) updateData.body = options.body;
        if (options.state) updateData.state = options.state;
        if (options.parent) updateData.parent_id = parseInt(options.parent);

        const article = await client.put(`/articles/${id}`, updateData);
        console.log(chalk.green('✓'), 'Article updated successfully');
        
        const parentOptions = articles.parent.opts();
        const format = parentOptions.format || 'table';
        formatOutput(article, format, columnConfigs.articles);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Delete article
  articles
    .command('delete <id>')
    .description('Delete an article permanently')
    .option('--force', 'skip confirmation')
    .action(async (id, options) => {
      try {
        if (!options.force) {
          console.log(chalk.yellow('⚠'), 'This will permanently delete the article.');
          console.log('Use --force to skip this confirmation.');
          process.exit(0);
        }

        await client.delete(`/articles/${id}`);
        console.log(chalk.green('✓'), 'Article deleted successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Search articles
  articles
    .command('search <query>')
    .description('Search articles')
    .action(async (query) => {
      try {
        const parentOptions = articles.parent.opts();
        const format = parentOptions.format || 'table';
        
        const params = {
          phrase: query
        };

        const response = await client.get('/articles/search', params);
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} articles\n`));
        formatOutput(data, format, columnConfigs.articles);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // List collections
  articles
    .command('collections')
    .description('List all collections')
    .action(async () => {
      try {
        const parentOptions = articles.parent.opts();
        const format = parentOptions.format || 'table';
        
        const response = await client.get('/help_center/collections');
        const data = response.data;

        console.log(chalk.green(`Found ${data.length} collections\n`));
        
        const collectionColumns = [
          { key: 'id', header: 'ID', width: 15 },
          { key: 'name', header: 'Name', width: 30 },
          { key: 'description', header: 'Description', width: 40 },
          { key: 'created_at', header: 'Created', type: 'date', width: 20 }
        ];
        
        formatOutput(data, format, collectionColumns);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Create collection
  articles
    .command('create-collection')
    .description('Create a new collection')
    .requiredOption('-n, --name <name>', 'collection name')
    .option('-d, --description <description>', 'collection description')
    .action(async (options) => {
      try {
        const collectionData = {
          name: options.name
        };

        if (options.description) collectionData.description = options.description;

        const collection = await client.post('/help_center/collections', collectionData);
        console.log(chalk.green('✓'), 'Collection created successfully');
        console.log('Collection ID:', collection.id);
      } catch (error) {
        // Error is handled in the client
      }
    });
}