/* eslint-disable import/no-named-as-default */
// Importing the 'expect' function from the 'chai' library for assertions
import { expect } from 'chai';
// Importing the redisClient from the utils directory
import redisClient from '../../utils/redis';

// Describing the test suite for RedisClient utility
describe('+ RedisClient utility', () => {
  // Before hook to set a timeout before running the tests
  before(function (done) {
    this.timeout(10000); // Setting the timeout to 10 seconds
    setTimeout(done, 4000); // Delaying the start of tests by 4 seconds
  });

  // Test case to check if the Redis client is alive
  it('+ Client is alive', () => {
    expect(redisClient.isAlive()).to.equal(true); // Expecting the client to be alive
  });

  // Test case to check setting and getting a value in Redis
  it('+ Setting and getting a value', async function () {
    await redisClient.set('test_key', 345, 10); // Setting a key-value pair with an expiration of 10 seconds
    expect(await redisClient.get('test_key')).to.equal('345'); // Expecting the value to be '345'
  });

  // Test case to check setting and getting an expired value in Redis
  it('+ Setting and getting an expired value', async function () {
    await redisClient.set('test_key', 356, 1); // Setting a key-value pair with an expiration of 1 second
    setTimeout(async () => {
      expect(await redisClient.get('test_key')).to.not.equal('356'); // Expecting the value to not be '356' after expiration
    }, 2000); // Checking after 2 seconds
  });

  // Test case to check setting and getting a deleted value in Redis
  it('+ Setting and getting a deleted value', async function () {
    await redisClient.set('test_key', 345, 10); // Setting a key-value pair with an expiration of 10 seconds
    await redisClient.del('test_key'); // Deleting the key
    setTimeout(async () => {
      console.log('del: test_key ->', await redisClient.get('test_key')); // Logging the value of the deleted key
      expect(await redisClient.get('test_key')).to.be.null; // Expecting the value to be null
    }, 2000); // Checking after 2 seconds
  });
});
