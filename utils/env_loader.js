import { existsSync, readFileSync } from 'fs'; // eslint-disable-line

/**
 * Loads the appropriate environment variables for an event.
 */
const envLoader = () => {
  // Get the current npm lifecycle event or default to 'dev'
  const env = process.env.npm_lifecycle_event || 'dev';
  // Set the path to the appropriate environment file
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    // Read the file and set the environment
    const data = readFileSync(path, 'utf-8').trim().split('\n');
    // Loop through the data and set the environment variables
    for (const line of data) {
      // Get the position of the delimiter
      const delimPosition = line.indexOf('=');
      // Get the variable and value
      const variable = line.substring(0, delimPosition);
      // Get the value
      const value = line.substring(delimPosition + 1);
      // Set the environment variable
      process.env[variable] = value;
    }
  }
};

export default envLoader;
