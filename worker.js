/* eslint-disable import/no-named-as-default */
// Import the writeFile function from the fs module
import { writeFile } from 'fs';
// Import the promisify function from the util module
import { promisify } from 'util';
// Import the Queue class from the bull library
import Queue from 'bull/lib/queue';
// Import the imgThumbnail function from the image-thumbnail library
import imgThumbnail from 'image-thumbnail';
// Import the core module from the mongodb library
import mongoDBCore from 'mongodb/lib/core';
// Import the dbClient from the utils/db module
import dbClient from './utils/db';
// Import the Mailer from the utils/mailer module
import Mailer from './utils/EmailService';

// Promisify the writeFile function
const writeFileAsync = promisify(writeFile);
// Create a new Queue instance for thumbnail generation
const fileQueue = new Queue('thumbnail generation');
// Create a new Queue instance for email sending
const userQueue = new Queue('email sending');

/**
 * Generates the thumbnail of an image with a given width size.
 * @param {String} filePath The location of the original file.
 * @param {number} size The width of the thumbnail.
 * @returns {Promise<void>}
 */
// Define the generateThumbnail function
const generateThumbnail = async (filePath, size) => {
  // Generate the thumbnail buffer
  const buffer = await imgThumbnail(filePath, { width: size });
  // Log the file generation process
  console.log(`Generating file: ${filePath}, size: ${size}`);
  // Write the thumbnail buffer to a new file
  return writeFileAsync(`${filePath}_${size}`, buffer);
};

// Process jobs in the fileQueue
fileQueue.process(async (job, done) => {
  // Get the fileId from the job data
  const fileId = job.data.fileId || null;
  // Get the userId from the job data
  const userId = job.data.userId || null;

  // Throw an error if fileId is missing
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  // Throw an error if userId is missing
  if (!userId) {
    throw new Error('Missing userId');
  }
  // Log the job processing
  console.log('Processing', job.data.name || '');
  // Find the file in the database
  const file = await (await dbClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });
  // Throw an error if the file is not found
  if (!file) {
    throw new Error('File not found');
  }
  // Define the thumbnail sizes
  const sizes = [500, 250, 100];
  // Generate thumbnails for all sizes
  Promise.all(sizes.map((size) => generateThumbnail(file.localPath, size)))
    .then(() => {
      // Mark the job as done
      done();
    });
});

// Process jobs in the userQueue
userQueue.process(async (job, done) => {
  // Get the userId from the job data
  const userId = job.data.userId || null;

  // Throw an error if userId is missing
  if (!userId) {
    throw new Error('Missing userId');
  }
  // Find the user in the database
  const user = await (await dbClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  // Throw an error if the user is not found
  if (!user) {
    throw new Error('User not found');
  }
  // Log the welcome message
  console.log(`Welcome ${user.email}!`);
  try {
    // Define the email subject
    const mailSubject = 'Welcome to ALX-Files_Manager by B3zaleel';
    // Define the email content
    const mailContent = [
      '<div>',
      '<h3>Hello {{user.name}},</h3>',
      'Welcome to <a href="https://github.com/B3zaleel/alx-files_manager">',
      'ALX-Files_Manager</a>, ',
      'a simple file management API built with Node.js by ',
      '<a href="https://github.com/B3zaleel">Bezaleel Olakunori</a>. ',
      'We hope it meets your needs.',
      '</div>',
    ].join('');
    // Send the welcome email
    Mailer.sendMail(Mailer.buildMessage(user.email, mailSubject, mailContent));
    // Mark the job as done
    done();
  } catch (err) {
    // Mark the job as done with an error
    done(err);
  }
});
