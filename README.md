# Intercom CLI

A command-line interface for interacting with the Intercom API. This tool allows you to manage users, contacts, conversations, companies, and articles directly from your terminal.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd intercom-cli

# Install dependencies
npm install

# Make the CLI globally available
npm link
```

## Configuration

### Authentication

Before using the CLI, you need to set up your Intercom access token:

```bash
# Set your access token
intercom auth set-token YOUR_ACCESS_TOKEN

# Check authentication status
intercom auth status

# Remove stored token
intercom auth remove-token
```

Alternatively, you can set the `INTERCOM_ACCESS_TOKEN` environment variable:

```bash
export INTERCOM_ACCESS_TOKEN=your_access_token_here
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Available environment variables:

- `INTERCOM_ACCESS_TOKEN` - Your Intercom API access token
- `INTERCOM_OUTPUT_FORMAT` - Default output format (json, table, csv)
- `INTERCOM_API_URL` - API base URL (defaults to https://api.intercom.io)
- `INTERCOM_ADMIN_ID` - Your admin ID for operations requiring it

## Usage

### Global Options

All commands support these global options:

- `-f, --format <format>` - Output format: json, table, or csv (default: table)
- `-e, --env <environment>` - Environment to use (default: production)
- `-h, --help` - Display help information
- `-V, --version` - Display version information

### User Management

```bash
# List users
intercom users list
intercom users list --limit 100
intercom users list --all  # Fetch all users

# Get user details
intercom users get USER_ID
intercom users get user@example.com

# Create a new user
intercom users create --email user@example.com --name "John Doe"
intercom users create -e user@example.com -n "John Doe" -p "+1234567890"

# Update user
intercom users update USER_ID --name "Jane Doe"
intercom users update USER_ID --custom '{"plan":"premium","status":"active"}'

# Delete user
intercom users delete USER_ID --force

# Search users
intercom users search "john"
```

### Contact Management

```bash
# List contacts
intercom contacts list
intercom contacts list --limit 100

# Get contact details
intercom contacts get CONTACT_ID

# Create contact
intercom contacts create --email contact@example.com --name "Contact Name"
intercom contacts create -e contact@example.com -n "Lead Name" --role lead

# Update contact
intercom contacts update CONTACT_ID --name "Updated Name"

# Delete contact
intercom contacts delete CONTACT_ID --force

# Search contacts
intercom contacts search "example.com"

# Convert contact to user
intercom contacts convert CONTACT_ID
intercom contacts convert CONTACT_ID --email user@example.com
```

### Conversation Management

```bash
# List conversations
intercom conversations list
intercom conversations list --state open
intercom conversations list --unassigned
intercom conversations list --assignee ADMIN_ID

# Get conversation with messages
intercom conversations get CONVERSATION_ID
intercom conversations get CONVERSATION_ID --parts  # Include messages

# Reply to conversation
intercom conversations reply CONVERSATION_ID -m "Your message here"
intercom conversations reply CONVERSATION_ID -m "Internal note" -t note

# Manage conversation state
intercom conversations close CONVERSATION_ID
intercom conversations open CONVERSATION_ID
intercom conversations snooze CONVERSATION_ID --until 1640995200

# Assign conversation
intercom conversations assign CONVERSATION_ID --admin ADMIN_ID
intercom conversations assign CONVERSATION_ID --team TEAM_ID

# Tag management
intercom conversations tag CONVERSATION_ID TAG_ID
intercom conversations untag CONVERSATION_ID TAG_ID

# Search conversations
intercom conversations search "payment issue"
```

### Company Management

```bash
# List companies
intercom companies list
intercom companies list --all

# Get company details
intercom companies get COMPANY_ID

# Create company
intercom companies create -i "company-123" -n "Acme Corp"
intercom companies create -i "company-123" -n "Acme Corp" -p "Enterprise" -s 500

# Update company
intercom companies update COMPANY_ID --name "Updated Corp"
intercom companies update COMPANY_ID --plan "Premium" --size 1000

# Delete company
intercom companies delete COMPANY_ID --force

# Manage company users
intercom companies users COMPANY_ID
intercom companies attach-user COMPANY_ID USER_ID
intercom companies detach-user COMPANY_ID USER_ID

# Search companies
intercom companies search "acme"
```

### Article Management

```bash
# List articles
intercom articles list
intercom articles list --state published

# Get article
intercom articles get ARTICLE_ID

# Create article
intercom articles create -t "Article Title" -a AUTHOR_ID
intercom articles create -t "How to Guide" -a 123 -b "Article content..." -s published

# Update article
intercom articles update ARTICLE_ID --title "Updated Title"
intercom articles update ARTICLE_ID --state published

# Delete article
intercom articles delete ARTICLE_ID --force

# Search articles
intercom articles search "installation"

# Collection management
intercom articles collections
intercom articles create-collection -n "Getting Started" -d "Beginner guides"
```

## Output Formats

### Table Format (Default)

Displays data in a formatted table for easy reading:

| ID        | Email            | Name     |
|-----------|------------------|----------|
| 123456789 | user@example.com | John Doe |

### JSON Format

```bash
intercom users list --format json
```

### CSV Format

```bash
intercom users list --format csv > users.csv
```

## Error Handling

The CLI provides clear error messages for common issues:

- Authentication errors - prompts to set token
- Rate limiting - shows when limit resets
- Not found errors - clear messages
- Network errors - connection issues

## Advanced Usage

### Pagination

Most list commands support pagination:

- Use `--limit` to control page size
- Use `--all` to fetch all records (may take time for large datasets)

### Custom Attributes

Many commands support custom attributes via JSON:

```bash
intercom users create -e user@example.com --custom '{"plan":"pro","credits":100}'
```

### Batch Operations

For batch operations, consider using the CLI with shell scripts:

```bash
# Export all users to CSV
intercom users list --all --format csv > all_users.csv

# Process multiple users
cat user_ids.txt | while read id; do
  intercom users get "$id" --format json
done
```

## Troubleshooting

1. **Authentication Issues**
   - Verify your access token is correct
   - Check token permissions in Intercom settings

2. **Rate Limiting**
   - The CLI will show when rate limits reset
   - Consider adding delays in scripts

3. **Network Issues**
   - Check your internet connection
   - Verify API endpoint is accessible

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)