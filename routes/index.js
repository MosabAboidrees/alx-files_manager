// eslint-disable-next-line no-unused-vars
import { Express } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { APIError, errorResponse } from '../middlewares/error';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';

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
  // Route to get the current user
  api.get('/users/me', xTokenAuthenticate, UsersController.getMe);
  // Route to authenticate a user
  api.get('/connect', basicAuthenticate, AuthController.getConnect);
  // Route to log out a user
  api.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);
  // Route to upload a file
  api.post('/files', xTokenAuthenticate, FilesController.postUpload);
  // Route to publish a file
  api.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  // Route to unpublish a file
  api.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
// Route to get a file
  api.get('/files/:id/data', FilesController.getFile);
  // Route to handle all other requests with a 404 error
  api.all('*', (req, res, next) => {
    errorResponse(new APIError(404, `Cannot ${req.method} ${req.url}`), req, res, next);
  });
  // Middleware to handle errors
  api.use(errorResponse);
};

export default injectRoutes;
