import express from 'express';
// Function to add middlewares to the given express application
/**
 * Adds middlewares to the given express application.
 * @param {express.Express} api The express application.
 */
const injectMiddlewares = (api) => {
  // Use the express.json middleware with a limit of 200mb
  api.use(express.json({ limit: '200mb' }));
};

// Export the injectMiddlewares function as the default export
export default injectMiddlewares;
