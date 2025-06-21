import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import { validateToken } from '../utils/auth.js';

class IntercomClient {
  constructor() {
    this.baseURL = process.env.INTERCOM_API_URL || 'https://api.intercom.io';
    this.apiVersion = '2.11';
  }

  async getHeaders() {
    const token = await validateToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Intercom-Version': this.apiVersion
    };
  }

  async request(method, endpoint, data = null, params = null, showSpinner = true) {
    const spinner = showSpinner ? ora('Loading...').start() : null;

    try {
      const headers = await this.getHeaders();
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers,
        params,
        data
      };

      const response = await axios(config);
      
      if (spinner) spinner.succeed();
      
      return response.data;
    } catch (error) {
      if (spinner) spinner.fail();
      
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error(chalk.red('Authentication Error:'), 'Invalid access token');
          console.log('\nPlease check your access token:');
          console.log(chalk.cyan('  intercom auth set-token <your-access-token>'));
          break;
        
        case 403:
          console.error(chalk.red('Permission Error:'), 'You do not have permission to perform this action');
          break;
        
        case 404:
          console.error(chalk.red('Not Found:'), data.errors?.[0]?.message || 'Resource not found');
          break;
        
        case 429:
          console.error(chalk.red('Rate Limit:'), 'Too many requests. Please try again later.');
          if (error.response.headers['x-ratelimit-reset']) {
            const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
            console.log(chalk.yellow('Rate limit resets at:'), resetTime.toLocaleString());
          }
          break;
        
        default:
          console.error(chalk.red(`Error ${status}:`), data.errors?.[0]?.message || data.message || 'An error occurred');
      }
    } else if (error.request) {
      console.error(chalk.red('Network Error:'), 'Could not reach Intercom API');
    } else {
      console.error(chalk.red('Error:'), error.message);
    }
    
    process.exit(1);
  }

  // Pagination helper
  async getAllPages(endpoint, params = {}) {
    let allData = [];
    let nextPage = null;
    
    do {
      const response = await this.request('GET', endpoint, null, { ...params, starting_after: nextPage });
      
      if (response.data) {
        allData = allData.concat(response.data);
      }
      
      nextPage = response.pages?.next?.starting_after;
    } while (nextPage);
    
    return allData;
  }

  // API Methods
  async get(endpoint, params = {}) {
    return this.request('GET', endpoint, null, params);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

export default new IntercomClient();