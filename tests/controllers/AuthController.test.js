/* eslint-disable import/no-named-as-default */
// Import the database client
import dbClient from '../../utils/db';

// Describe the AuthController test suite
describe('+ AuthController', () => {
  // Mock user data for testing
  const mockUser = {
    email: 'kaido@beast.com',
    password: 'hyakuju_no_kaido_wano',
  };
  // Variable to store the authentication token
  let token = '';

  // Before all tests, set up the environment
  before(function (done) {
    this.timeout(10000); // Set timeout for the setup
    // Connect to the users collection in the database
    dbClient.usersCollection()
      .then((usersCollection) => {
        // Delete any existing user with the mock user's email
        usersCollection.deleteMany({ email: mockUser.email })
          .then(() => {
            // Create a new user with the mock user's data
            request.post('/users')
              .send({
                email: mockUser.email,
                password: mockUser.password,
              })
              .expect(201) // Expect a 201 Created response
              .end((requestErr, res) => {
                if (requestErr) {
                  return done(requestErr); // Handle request error
                }
                // Check if the response contains the correct email and a valid ID
                expect(res.body.email).to.eql(mockUser.email);
                expect(res.body.id.length).to.be.greaterThan(0);
                done(); // Finish the setup
              });
          })
          .catch((deleteErr) => done(deleteErr)); // Handle deletion error
      }).catch((connectErr) => done(connectErr)); // Handle connection error
  });

  // Describe the GET /connect endpoint tests
  describe('+ GET: /connect', () => {
    // Test case for missing Authorization header
    it('+ Fails with no "Authorization" header field', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/connect')
        .expect(401) // Expect a 401 Unauthorized response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for non-existent user
    it('+ Fails for a non-existent user', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/connect')
        .auth('foo@bar.com', 'raboof', { type: 'basic' }) // Use basic auth with non-existent user
        .expect(401) // Expect a 401 Unauthorized response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for valid email and wrong password
    it('+ Fails with a valid email and wrong password', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/connect')
        .auth(mockUser.email, 'raboof', { type: 'basic' }) // Use basic auth with valid email and wrong password
        .expect(401) // Expect a 401 Unauthorized response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for invalid email and valid password
    it('+ Fails with an invalid email and valid password', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/connect')
        .auth('zoro@strawhat.com', mockUser.password, { type: 'basic' }) // Use basic auth with invalid email and valid password
        .expect(401) // Expect a 401 Unauthorized response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for existing user
    it('+ Succeeds for an existing user', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/connect')
        .auth(mockUser.email, mockUser.password, { type: 'basic' }) // Use basic auth with valid email and password
        .expect(200) // Expect a 200 OK response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response contains a valid token
          expect(res.body.token).to.exist;
          expect(res.body.token.length).to.be.greaterThan(0);
          token = res.body.token; // Store the token for later use
          done(); // Finish the test
        });
    });
  });

  // Describe the GET /disconnect endpoint tests
  describe('+ GET: /disconnect', () => {
    // Test case for missing X-Token header
    it('+ Fails with no "X-Token" header field', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/disconnect')
        .expect(401) // Expect a 401 Unauthorized response
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for non-existent user
    it('+ Fails for a non-existent user', function (done) {
      this.timeout(5000); // Set timeout for the test
      request.get('/disconnect')
        .set('X-Token', 'raboof') // Set an invalid token
        .expect(401) // Expect a 401 Unauthorized response
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr); // Handle request error
          }
          // Check if the response contains the correct error message
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done(); // Finish the test
        });
    });

    // Test case for valid X-Token header
    it('+ Succeeds with a valid "X-Token" field', function (done) {
      request.get('/disconnect')
        .set('X-Token', token) // Set the valid token
        .expect(204) // Expect a 204 No Content response
        .end((err, res) => {
          if (err) {
            return done(err); // Handle request error
          }
          // Check if the response is empty and headers are correct
          expect(res.body).to.deep.eql({});
          expect(res.text).to.eql('');
          expect(res.headers['content-type']).to.not.exist;
          expect(res.headers['content-length']).to.not.exist;
          done(); // Finish the test
        });
    });
  });
});
