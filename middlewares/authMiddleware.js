/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { getUserFromXToken, getUserFromAuthorization } from '../utils/authUtils';

/**
 * Applies Basic authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const basicAuthenticate = async (req, res, next) => {
  // Get the user from the Authorization header
  const user = await getUserFromAuthorization(req);

  // If no user is found, respond with 401 Unauthorized
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Attach the user to the request object
  req.user = user;

  // Call the next middleware function
  next();
};

/**
 * Applies X-Token authentication to a route.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const xTokenAuthenticate = async (req, res, next) => {
  // Get the user from the X-Token header
  const user = await getUserFromXToken(req);

  // If no user is found, respond with 401 Unauthorized
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Attach the user to the request object
  req.user = user;

  // Call the next middleware function
  next();
};
