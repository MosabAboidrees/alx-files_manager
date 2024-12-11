/* eslint-disable import/no-named-as-default */
// Import the dbClient module from the utils directory
import dbClient from '../../utils/db';

// Describe the test suite for the DBClient utility
describe('+ DBClient utility', () => {
  // Before running the tests, perform the following setup
  before(function (done) {
    // Set a timeout of 10000ms for the setup
    this.timeout(10000);
    // Connect to the users and files collections
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        // Delete all documents from both collections
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done()) // Call done() if successful
          .catch((deleteErr) => done(deleteErr)); // Call done() with error if deletion fails
      }).catch((connectErr) => done(connectErr)); // Call done() with error if connection fails
  });

  // Test case to check if the client is alive
  it('+ Client is alive', () => {
    // Expect the isAlive method to return true
    expect(dbClient.isAlive()).to.equal(true);
  });

  // Test case to check if nbUsers returns the correct value
  it('+ nbUsers returns the correct value', async () => {
    // Expect the nbUsers method to return 0
    expect(await dbClient.nbUsers()).to.equal(0);
  });

  // Test case to check if nbFiles returns the correct value
  it('+ nbFiles returns the correct value', async () => {
    // Expect the nbFiles method to return 0
    expect(await dbClient.nbFiles()).to.equal(0);
  });
});
