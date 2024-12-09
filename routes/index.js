// eslint-disable-next-line no-unused-vars
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import { APIError, errorResponse } from '../middlewares/error';

/**
 * Injects routes with their handlers to the given Express application.
 * @param {Express} api
 */
const injectRoutes = (api) => {
  // Route to get the status of the application
  api.get('/status', AppController.getStatus);
  // Route to get the statistics of the application
  api.get('/stats', AppController.getStats);
  // Route to handle user registration
  api.post('/users', UsersController.postNew);
  // Route to handle all other requests with a 404 error
  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  // Middleware to handle errors
  api.use(errorResponse);
};

export default injectRoutes;
