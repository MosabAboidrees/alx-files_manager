/* eslint-disable import/no-named-as-default */
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/*
  * AppController class
  * Contains methods that will return the status of the API
  * and the number of users and files in the database
  * getStatus: returns the status of the API
  * getStats: returns the number of users and files in the database
  * @static
  * @returns {object} - status of the API and the number of users
  * and files in the database
*/
export default class AppController {
  static getStatus(req, res) {
    // Check if the redis and database clients are alive
    res.status(200).json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  /* getStats method
  * Returns the number of users and files in the database
  * @static
  * @param {object} req - request object
  */
  static getStats(req, res) {
    // Get the number of users and files in the database
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usersCount, filesCount]) => {
        // Return the number of users and files in the database
        res.status(200).json({ users: usersCount, files: filesCount });
      });
  }
}
