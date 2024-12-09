/* eslint-disable import/no-named-as-default */
// Import the sha1 hashing function
import sha1 from 'sha1';
// Import the Queue class from the bull library
import Queue from 'bull/lib/queue';
// Import the database client
import dbClient from '../utils/db';

// Create a new queue for email sending
const userQueue = new Queue('email sending');

// Define the UsersController class
export default class UsersController {
  // Define the postNew method to handle user registration
  static async postNew(req, res) {
    // Get the email from the request body
    const email = req.body ? req.body.email : null;
    // Get the password from the request body
    const password = req.body ? req.body.password : null;

    // Check if email is provided
    if (!email) {
      // Respond with a 400 status and error message if email is missing
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    // Check if password is provided
    if (!password) {
      // Respond with a 400 status and error message if password is missing
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    // Check if a user with the provided email already exists
    const user = await (await dbClient.usersCollection()).findOne({ email });

    // If user already exists, respond with a 400 status and error message
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    // Insert the new user into the database with the hashed password
    const insertionInfo = await (await dbClient.usersCollection())
      .insertOne({ email, password: sha1(password) });
    // Get the inserted user's ID
    const userId = insertionInfo.insertedId.toString();

    // Add the user ID to the email sending queue
    userQueue.add({ userId });
    // Respond with a 201 status and the new user's email and ID
    res.status(201).json({ email, id: userId });
  }

  // Define the getMe method to handle fetching the current user's information
  static async getMe(req, res) {
    // Get the user from the request
    const { user } = req;

    // Respond with a 200 status and the user's email and ID
    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
