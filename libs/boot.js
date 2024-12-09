/**
 * @file boot.js
 * @description This file contains the function to start the server.
 */

import envLoader from '../utils/env_loader';

/**
 * Starts the server with the given API.
 * @param {Object} api - The API instance to start the server with.
 */
const startServer = (api) => {
  // Load environment variables
  envLoader();
  // Define the port to listen on, defaulting to 5000 if not specified
  const port = process.env.PORT || 5000;
  // Get the current environment, defaulting to 'dev' if not specified
  const env = process.env.npm_lifecycle_event || 'dev';
  // Start the API server and log the environment and port
  api.listen(port, () => {
    console.log(`[${env}] API has started listening at port:${port}`);
  });
};

export default startServer;
