/**
 * @file AppController.test.js
 * @description Unit tests for AppController endpoints.
 * @module tests/controllers/AppController.test
 */

/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db';

describe('+ AppController', () => {
  /**
   * @description Setup hook to clear the database collections before running tests.
   * @param {Function} done - Callback to indicate completion.
   */
  before(function (done) {
    this.timeout(10000);
    Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
          .then(() => done())
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  describe('+ GET: /status', () => {
    /**
     * @description Test to check if services are online.
     * @param {Function} done - Callback to indicate completion.
     */
    it('+ Services are online', function (done) {
      request.get('/status')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ redis: true, db: true });
          done();
        });
    });
  });

  describe('+ GET: /stats', () => {
    /**
     * @description Test to check if the statistics about db collections are correct.
     * @param {Function} done - Callback to indicate completion.
     */
    it('+ Correct statistics about db collections', function (done) {
      request.get('/stats')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ users: 0, files: 0 });
          done();
        });
    });

    /**
     * @description Test to check if the statistics about db collections are correct after inserting data.
     * @param {Function} done - Callback to indicate completion.
     */
    it('+ Correct statistics about db collections [alt]', function (done) {
      this.timeout(10000);
      Promise.all([dbClient.usersCollection(), dbClient.filesCollection()])
        .then(([usersCollection, filesCollection]) => {
          Promise.all([
            usersCollection.insertMany([{ email: 'john@mail.com' }]),
            filesCollection.insertMany([
              { name: 'foo.txt', type: 'file'},
              {name: 'pic.png', type: 'image' },
            ])
          ])
            .then(() => {
              request.get('/stats')
                .expect(200)
                .end((err, res) => {
                  if (err) {
                    return done(err);
                  }
                  expect(res.body).to.deep.eql({ users: 1, files: 2 });
                  done();
                });
            })
            .catch((deleteErr) => done(deleteErr));
        }).catch((connectErr) => done(connectErr));
    });
  });
});
