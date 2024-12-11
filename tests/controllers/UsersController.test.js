/* eslint-disable import/no-named-as-default */
// Import the database client
import dbClient from '../../utils/db';

// Describe the UserController test suite
describe('+ UserController', () => {
  // Mock user data for testing
  const mockUser = {
    email: 'beloxxi@blues.com',
    password: 'melody1982',
  };

  // Before all tests, clean up the database
  before(function (done) {
    this.timeout(10000); // Set timeout for the before hook
    dbClient.usersCollection() // Get the users collection from the database
      .then((usersCollection) => {
        usersCollection.deleteMany({ email: mockUser.email }) // Delete any existing users with the mock email
          .then(() => done()) // Call done when deletion is complete
          .catch((deleteErr) => done(deleteErr)); // Handle deletion error
      }).catch((connectErr) => done(connectErr)); // Handle connection error
    setTimeout(done, 5000); // Set a timeout to ensure the database is cleaned up
  });

  // Describe the POST /users endpoint tests
  describe('+ POST: /users', () => {
    // Test case for missing email
    it('+ Fails when there is no email and there is password', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.post('/users') // Make a POST request to /users
        .send({
          password: mockUser.password, // Send only the password
        })
        .expect(400) // Expect a 400 Bad Request response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          expect(res.body).to.deep.eql({ error: 'Missing email' }); // Check the response body
          done(); // Call done to finish the test
        });
    });

    // Test case for missing password
    it('+ Fails when there is email and there is no password', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.post('/users') // Make a POST request to /users
        .send({
          email: mockUser.email, // Send only the email
        })
        .expect(400) // Expect a 400 Bad Request response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          expect(res.body).to.deep.eql({ error: 'Missing password' }); // Check the response body
          done(); // Call done to finish the test
        });
    });

    // Test case for successful user creation
    it('+ Succeeds when the new user has a password and email', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.post('/users') // Make a POST request to /users
        .send({
          email: mockUser.email, // Send the email
          password: mockUser.password, // Send the password
        })
        .expect(201) // Expect a 201 Created response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          expect(res.body.email).to.eql(mockUser.email); // Check the response email
          expect(res.body.id.length).to.be.greaterThan(0); // Check the response id
          done(); // Call done to finish the test
        });
    });

    // Test case for user already exists
    it('+ Fails when the user already exists', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.post('/users') // Make a POST request to /users
        .send({
          email: mockUser.email, // Send the email
          password: mockUser.password, // Send the password
        })
        .expect(400) // Expect a 400 Bad Request response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          expect(res.body).to.deep.eql({ error: 'Already exist' }); // Check the response body
          done(); // Call done to finish the test
        });
    });
  });

});
