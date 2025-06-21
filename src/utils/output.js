import Table from 'cli-table3';
import chalk from 'chalk';

export function formatOutput(data, format, columns) {
  switch (format) {
    case 'json':
      return console.log(JSON.stringify(data, null, 2));
    
    case 'csv':
      return formatCSV(data, columns);
    
    case 'table':
    default:
      return formatTable(data, columns);
  }
}

function formatTable(data, columns) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log(chalk.yellow('No data found'));
    return;
  }

  const items = Array.isArray(data) ? data : [data];
  
  const table = new Table({
    head: columns.map(col => chalk.cyan(col.header)),
    colWidths: columns.map(col => col.width || null).filter(Boolean),
    wordWrap: true
  });

  items.forEach(item => {
    const row = columns.map(col => {
      const value = getNestedValue(item, col.key);
      return formatValue(value, col.type);
    });
    table.push(row);
  });

  console.log(table.toString());
}

function formatCSV(data, columns) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log(chalk.yellow('No data found'));
    return;
  }

  const items = Array.isArray(data) ? data : [data];
  
  // Header
  console.log(columns.map(col => `"${col.header}"`).join(','));
  
  // Data rows
  items.forEach(item => {
    const row = columns.map(col => {
      const value = getNestedValue(item, col.key);
      const formatted = formatValue(value, col.type);
      // Escape quotes and wrap in quotes
      return `"${String(formatted).replace(/"/g, '""')}"`;
    });
    console.log(row.join(','));
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
}

function formatValue(value, type) {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (type) {
    case 'date':
      return new Date(value).toLocaleString();
    
    case 'boolean':
      return value ? chalk.green('Yes') : chalk.red('No');
    
    case 'array':
      return Array.isArray(value) ? value.join(', ') : value;
    
    default:
      return String(value);
  }
}

// Predefined column configurations
export const columnConfigs = {
  users: [
    { key: 'id', header: 'ID', width: 15 },
    { key: 'email', header: 'Email', width: 30 },
    { key: 'name', header: 'Name', width: 25 },
    { key: 'created_at', header: 'Created', type: 'date', width: 20 },
    { key: 'last_seen_at', header: 'Last Seen', type: 'date', width: 20 }
  ],
  
  contacts: [
    { key: 'id', header: 'ID', width: 15 },
    { key: 'email', header: 'Email', width: 30 },
    { key: 'name', header: 'Name', width: 25 },
    { key: 'phone', header: 'Phone', width: 20 },
    { key: 'created_at', header: 'Created', type: 'date', width: 20 }
  ],
  
  conversations: [
    { key: 'id', header: 'ID', width: 15 },
    { key: 'created_at', header: 'Created', type: 'date', width: 20 },
    { key: 'updated_at', header: 'Updated', type: 'date', width: 20 },
    { key: 'state', header: 'State', width: 15 },
    { key: 'source.type', header: 'Source', width: 15 },
    { key: 'assignee.name', header: 'Assignee', width: 20 }
  ],
  
  companies: [
    { key: 'id', header: 'ID', width: 15 },
    { key: 'company_id', header: 'Company ID', width: 20 },
    { key: 'name', header: 'Name', width: 30 },
    { key: 'created_at', header: 'Created', type: 'date', width: 20 },
    { key: 'user_count', header: 'Users', width: 10 }
  ],
  
  articles: [
    { key: 'id', header: 'ID', width: 15 },
    { key: 'title', header: 'Title', width: 40 },
    { key: 'state', header: 'State', width: 15 },
    { key: 'author.name', header: 'Author', width: 20 },
    { key: 'updated_at', header: 'Updated', type: 'date', width: 20 }
  ]
};