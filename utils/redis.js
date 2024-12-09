import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Represents a Redis client for managing cache or key-value pairs in a Redis database.
 */
class RedisClient {
  /**
   * Initializes the Redis client and sets up connection status.
   */
  constructor() {
    // Create a Redis client instance
    this.client = createClient();

    // Tracks the connection status of the Redis client
    this.isClientConnected = true;

    // Event listener for connection errors
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false; // Update connection status on error
    });

    // Event listener for successful connection
    this.client.on('connect', () => {
      this.isClientConnected = true; // Update connection status on successful connection
    });
  }

  /**
   * Checks if the Redis client is currently connected to the server.
   * @returns {boolean} - `true` if connected, otherwise `false`.
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value associated with a specified key from the Redis database.
   * @param {String} key - The key whose value needs to be fetched.
   * @returns {Promise<String | null>} - The value associated with the key or `null` if not found.
   */
  async get(key) {
    // Promisify the GET method and execute it
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Stores a key-value pair in the Redis database with an expiration time.
   * @param {String} key - The key under which the value should be stored.
   * @param {String | Number | Boolean} value - The value to store in Redis.
   * @param {Number} duration - The time-to-live (TTL) for the key in seconds.
   * @returns {Promise<void>} - Resolves when the key-value pair is successfully stored.
   */
  async set(key, value, duration) {
    // Promisify the SETEX method and execute it to set a key with an expiration time
    await promisify(this.client.SETEX).bind(this.client)(key, duration, value);
  }

  /**
   * Deletes a key-value pair from the Redis database.
   * @param {String} key - The key to remove from the Redis store.
   * @returns {Promise<void>} - Resolves when the key is successfully deleted.
   */
  async del(key) {
    // Promisify the DEL method and execute it to delete a key
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

// Create and export a singleton instance of RedisClient for use across the application
export const redisClient = new RedisClient();
export default redisClient;
