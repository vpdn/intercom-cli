import chalk from 'chalk';
import client from '../api/client.js';
import { formatOutput, columnConfigs } from '../utils/output.js';

export function conversationCommands(program) {
  const conversations = program
    .command('conversations')
    .alias('conversation')
    .alias('conv')
    .description('Manage conversations');

  // List conversations
  conversations
    .command('list')
    .description('List conversations')
    .option('-l, --limit <number>', 'limit number of results', '20')
    .option('-s, --state <state>', 'filter by state (open, closed, snoozed)')
    .option('-a, --assignee <id>', 'filter by assignee ID')
    .option('--unassigned', 'show only unassigned conversations')
    .action(async (options) => {
      try {
        const parentOptions = conversations.parent.opts();
        const format = options.format || parentOptions.format || 'table';
        
        const params = { per_page: options.limit };
        
        if (options.state) params.state = options.state;
        if (options.assignee) params.assignee_id = options.assignee;
        if (options.unassigned) params.assignee_id = 'unassigned';

        const response = await client.get('/conversations', params);
        const data = response.conversations;

        console.log(chalk.green(`Found ${data.length} conversations\n`));
        formatOutput(data, format, columnConfigs.conversations);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Get conversation
  conversations
    .command('get <id>')
    .description('Get conversation details')
    .option('--metadata-only', 'show only conversation metadata without messages')
    .action(async (id, options) => {
      try {
        const parentOptions = conversations.parent.opts();
        const format = parentOptions.format || 'table';
        
        // Always fetch conversation parts unless metadata-only is requested
        const params = options.metadataOnly ? {} : { display_as: 'plaintext' };
        const conversation = await client.get(`/conversations/${id}`, params);
        
        if (format === 'json') {
          formatOutput(conversation, format);
        } else {
          // Display conversation info
          formatOutput(conversation, format, columnConfigs.conversations);
          
          // Display conversation messages unless metadata-only is requested
          if (!options.metadataOnly) {
            console.log(chalk.cyan('\nConversation Messages:'));
            console.log(chalk.gray('═'.repeat(80)));
            
            // Display initial conversation source if available
            if (conversation.source?.body) {
              const sourceAuthor = conversation.source.author?.name || 
                                 conversation.source.author?.email || 
                                 'Customer';
              const sourceType = conversation.source.author?.type || 'user';
              const sourceTime = new Date(conversation.created_at * 1000).toLocaleString();
              
              console.log(chalk.blue(`[Initial Message] ${sourceAuthor} (${sourceType}) - ${sourceTime}`));
              console.log(conversation.source.body);
              console.log(chalk.gray('─'.repeat(80)));
            }
            
            // Display conversation parts
            if (conversation.conversation_parts?.conversation_parts?.length > 0) {
              conversation.conversation_parts.conversation_parts.forEach((part, index) => {
                const author = part.author?.name || part.author?.email || 'Unknown';
                const authorType = part.author?.type || 'unknown';
                const time = new Date(part.created_at * 1000).toLocaleString();
                
                const authorColor = authorType === 'admin' ? chalk.green : 
                                  authorType === 'user' ? chalk.blue : 
                                  chalk.gray;
                
                console.log(authorColor(`[${index + 1}] ${author} (${authorType}) - ${time}`));
                console.log(part.body || chalk.italic('No message body'));
                console.log(chalk.gray('─'.repeat(80)));
              });
            } else if (!conversation.source?.body) {
              // No messages at all
              console.log(chalk.yellow('This conversation has no messages.'));
            }
          }
        }
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Reply to conversation
  conversations
    .command('reply <id>')
    .description('Reply to a conversation')
    .requiredOption('-m, --message <text>', 'message to send')
    .option('-t, --type <type>', 'reply type (comment, note)', 'comment')
    .option('-a, --assignee <id>', 'assign to admin ID')
    .action(async (id, options) => {
      try {
        const replyData = {
          type: options.type === 'note' ? 'admin' : 'admin',
          message_type: options.type,
          body: options.message,
          admin_id: process.env.INTERCOM_ADMIN_ID // You may want to fetch this or make it configurable
        };

        if (options.assignee) {
          replyData.assignee_id = options.assignee;
        }

        await client.post(`/conversations/${id}/reply`, replyData);
        console.log(chalk.green('✓'), 'Reply sent successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Close conversation
  conversations
    .command('close <id>')
    .description('Close a conversation')
    .action(async (id) => {
      try {
        await client.post(`/conversations/${id}/close`, {
          admin_id: process.env.INTERCOM_ADMIN_ID
        });
        console.log(chalk.green('✓'), 'Conversation closed successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Open conversation
  conversations
    .command('open <id>')
    .description('Open a conversation')
    .action(async (id) => {
      try {
        await client.post(`/conversations/${id}/open`, {
          admin_id: process.env.INTERCOM_ADMIN_ID
        });
        console.log(chalk.green('✓'), 'Conversation opened successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Snooze conversation
  conversations
    .command('snooze <id>')
    .description('Snooze a conversation')
    .requiredOption('-u, --until <timestamp>', 'snooze until timestamp (Unix timestamp)')
    .action(async (id, options) => {
      try {
        await client.post(`/conversations/${id}/snooze`, {
          admin_id: process.env.INTERCOM_ADMIN_ID,
          snoozed_until: parseInt(options.until)
        });
        
        const untilDate = new Date(parseInt(options.until) * 1000).toLocaleString();
        console.log(chalk.green('✓'), `Conversation snoozed until ${untilDate}`);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Assign conversation
  conversations
    .command('assign <id>')
    .description('Assign a conversation to an admin or team')
    .option('-a, --admin <id>', 'admin ID')
    .option('-t, --team <id>', 'team ID')
    .action(async (id, options) => {
      try {
        if (!options.admin && !options.team) {
          console.error(chalk.red('Error:'), 'Please specify either --admin or --team');
          process.exit(1);
        }

        const assignData = {
          type: options.admin ? 'admin' : 'team',
          admin_id: process.env.INTERCOM_ADMIN_ID,
          assignee_id: options.admin || options.team
        };

        await client.post(`/conversations/${id}/assign`, assignData);
        console.log(chalk.green('✓'), 'Conversation assigned successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Search conversations
  conversations
    .command('search <query>')
    .description('Search conversations')
    .action(async (query) => {
      try {
        const parentOptions = conversations.parent.opts();
        const format = parentOptions.format || 'table';
        
        const searchQuery = {
          query: {
            field: 'source.body',
            operator: '~',
            value: query
          }
        };

        const response = await client.post('/conversations/search', searchQuery);
        const data = response.conversations;

        console.log(chalk.green(`Found ${data.length} conversations\n`));
        formatOutput(data, format, columnConfigs.conversations);
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Add tag to conversation
  conversations
    .command('tag <id> <tagId>')
    .description('Add a tag to a conversation')
    .action(async (id, tagId) => {
      try {
        await client.post(`/conversations/${id}/tags`, {
          id: tagId,
          admin_id: process.env.INTERCOM_ADMIN_ID
        });
        console.log(chalk.green('✓'), 'Tag added successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });

  // Remove tag from conversation
  conversations
    .command('untag <id> <tagId>')
    .description('Remove a tag from a conversation')
    .action(async (id, tagId) => {
      try {
        await client.delete(`/conversations/${id}/tags/${tagId}`, {
          admin_id: process.env.INTERCOM_ADMIN_ID
        });
        console.log(chalk.green('✓'), 'Tag removed successfully');
      } catch (error) {
        // Error is handled in the client
      }
    });
}