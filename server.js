import express from 'express';
// Import the startServer function from the boot file
import startServer from './libs/boot';
// Import the injectRoutes function from the routes file
import injectRoutes from './routes';
// Import the injectMiddlewares function from the middlewares file
import injectMiddlewares from './libs/middlewares';

const server = express(); // Create a new express server

injectMiddlewares(server); // Inject middlewares
injectRoutes(server); // Inject routes
startServer(server); // Start the server

export default server; // Export the server
