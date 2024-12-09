import mongodb from 'mongodb';
// eslint-disable-next-line no-unused-vars
import Collection from 'mongodb/lib/collection';
import envLoader from './env_loader';

/**
 * Represents a MongoDB client for managing database connections and operations.
 */
class DBClient {
  /**
   * Initializes a new instance of the DBClient class.
   * Sets up the MongoDB client connection using environment variables or default values.
   */
  constructor() {
    // Load environment variables
    envLoader();

    // MongoDB server connection parameters
    const host = process.env.DB_HOST || 'localhost'; // Database host (default: localhost)
    const port = process.env.DB_PORT || 27017; // Database port (default: 27017)
    const database = process.env.DB_DATABASE || 'files_manager'; // Database name (default: files_manager)
    const dbURL = `mongodb://${host}:${port}/${database}`; // Construct MongoDB connection string

    // Create and connect the MongoDB client
    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
   * Checks if the MongoDB client is currently connected to the server.
   * @returns {boolean} - `true` if the client is connected, otherwise `false`.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves the total number of users in the `users` collection.
   * @returns {Promise<number>} - The number of users in the database.
   */
  async nbUsers() {
    // Count and return the number of documents in the `users` collection
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Retrieves the total number of files in the `files` collection.
   * @returns {Promise<number>} - The number of files in the database.
   */
  async nbFiles() {
    // Count and return the number of documents in the `files` collection
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Retrieves a reference to the `users` collection in the database.
   * @returns {Promise<Collection>} - A MongoDB `Collection` object for the `users` collection.
   */
  async usersCollection() {
    // Return a reference to the `users` collection
    return this.client.db().collection('users');
  }

  /**
   * Retrieves a reference to the `files` collection in the database.
   * @returns {Promise<Collection>} - A MongoDB `Collection` object for the `files` collection.
   */
  async filesCollection() {
    // Return a reference to the `files` collection
    return this.client.db().collection('files');
  }
}

// Create and export a singleton instance of DBClient for use across the application
export const dbClient = new DBClient();
export default dbClient;
