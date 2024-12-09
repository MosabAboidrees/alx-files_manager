/* eslint-disable import/no-named-as-default */
// Importing the uuid library and renaming v4 to uuidv4
import { v4 as uuidv4 } from 'uuid';
// Importing the redisClient from the utils directory
import redisClient from '../utils/redis';

// Exporting the AuthController class as default
export default class AuthController {
  // Static method to handle user connection
  static async getConnect(req, res) {
    // Extracting user from the request object
    const { user } = req;
    // Generating a unique token using uuidv4
    const token = uuidv4();

    // Storing the token and user ID in Redis with an expiration time of 24 hours
    await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);
    // Sending the token as a JSON response with status 200
    res.status(200).json({ token });
  }

  // Static method to handle user disconnection
  static async getDisconnect(req, res) {
    // Extracting the token from the request headers
    const token = req.headers['x-token'];

    // Deleting the token from Redis
    await redisClient.del(`auth_${token}`);
    // Sending a response with status 204 (No Content)
    res.status(204).send();
  }
}
