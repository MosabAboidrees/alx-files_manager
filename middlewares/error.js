/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Represents an error in this API.
 */
export class APIError extends Error {
  // Constructor for APIError class
  constructor(code, message) {
    super(); // Call the parent class constructor
    this.code = code || 500; // Set the error code, default to 500
    this.message = message; // Set the error message
  }
}

/**
 * Applies Basic authentication to a route.
 * @param {Error} err The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next function.
 */
export const errorResponse = (err, req, res, next) => {
  // Default error message
  const defaultMsg = `Failed to process ${req.url}`;

  // Check if the error is an instance of APIError
  if (err instanceof APIError) {
    // Send a JSON response with the error code and message
    res.status(err.code).json({ error: err.message || defaultMsg });
    return;
  }
  // Send a JSON response with a 500 status code and the error message
  res.status(500).json({
    error: err ? err.message || err.toString() : defaultMsg,
  });
};
