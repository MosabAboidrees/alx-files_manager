/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */

// Importing sha1 for hashing passwords
import sha1 from 'sha1';
// Importing Request from express
import { Request } from 'express';
// Importing core module from mongodb
import mongoDBCore from 'mongodb/lib/core';
// Importing dbClient for database operations
import dbClient from './db';
// Importing redisClient for Redis operations
import redisClient from './redis';

/**
 * Fetches the user from the Authorization header in the given request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>}
 */
export const getUserFromAuthorization = async (req) => {
  // Get the Authorization header from the request
  const authorization = req.headers.authorization || null;

  // If no Authorization header, return null
  if (!authorization) {
    return null;
  }
  // Split the Authorization header into parts
  const authorizationParts = authorization.split(' ');

  // If the Authorization header is not in the correct format, return null
  if (authorizationParts.length !== 2 || authorizationParts[0] !== 'Basic') {
    return null;
  }
  // Decode the base64 token
  const token = Buffer.from(authorizationParts[1], 'base64').toString();
  // Find the position of the separator
  const sepPos = token.indexOf(':');
  // Extract the email from the token
  const email = token.substring(0, sepPos);
  // Extract the password from the token
  const password = token.substring(sepPos + 1);
  // Find the user in the database by email
  const user = await (await dbClient.usersCollection()).findOne({ email });

  // If no user is found or the password does not match, return null
  if (!user || sha1(password) !== user.password) {
    return null;
  }
  // Return the user object
  return user;
};

/**
 * Fetches the user from the X-Token header in the given request object.
 * @param {Request} req The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>}
 */
export const getUserFromXToken = async (req) => {
  // Get the X-Token header from the request
  const token = req.headers['x-token'];

  // If no X-Token header, return null
  if (!token) {
    return null;
  }
  // Get the user ID from Redis using the token
  const userId = await redisClient.get(`auth_${token}`);
  // If no user ID is found, return null
  if (!userId) {
    return null;
  }
  // Find the user in the database by user ID
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  // Return the user object or null if not found
  return user || null;
};

// Export the functions as default
export default {
  getUserFromAuthorization: async (req) => getUserFromAuthorization(req),
  getUserFromXToken: async (req) => getUserFromXToken(req),
};
