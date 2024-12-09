/* eslint-disable no-unused-vars */
import fs from 'fs'; // Importing file system module
import readline from 'readline'; // Importing readline module for reading input
import { promisify } from 'util'; // Importing promisify from util module
import mimeMessage from 'mime-message'; // Importing mime-message module
import { gmail_v1 as gmailV1, google } from 'googleapis'; // Importing googleapis module

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send']; // Defining the scopes for Gmail API
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json'; // Path to store the token
const readFileAsync = promisify(fs.readFile); // Promisifying readFile function
const writeFileAsync = promisify(fs.writeFile); // Promisifying writeFile function

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  }); // Generating the authorization URL
  console.log('Authorize this app by visiting this url:', authUrl); // Logging the authorization URL
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }); // Creating readline interface
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close(); // Closing the readline interface
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err); // Logging error if any
        return;
      }
      oAuth2Client.setCredentials(token); // Setting the credentials
      writeFileAsync(TOKEN_PATH, JSON.stringify(token))
        .then(() => {
          console.log('Token stored to', TOKEN_PATH); // Logging success message
          callback(oAuth2Client); // Calling the callback function
        })
        .catch((writeErr) => console.error(writeErr)); // Logging error if any
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const clientSecret = credentials.web.client_secret; // Extracting client secret
  const clientId = credentials.web.client_id; // Extracting client ID
  const redirectURIs = credentials.web.redirect_uris; // Extracting redirect URIs
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0],
  ); // Creating OAuth2 client
  console.log('Client authorization beginning'); // Logging message
  // Check if we have previously stored a token.
  await readFileAsync(TOKEN_PATH)
    .then((token) => {
      oAuth2Client.setCredentials(JSON.parse(token)); // Setting credentials
      callback(oAuth2Client); // Calling the callback function
    }).catch(async () => getNewToken(oAuth2Client, callback)); // Getting new token if not found
  console.log('Client authorization done'); // Logging message
}

/**
 * Delivers a mail through the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {gmailV1.Schema$Message} mail The message to send.
 */
function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth }); // Creating Gmail API client

  gmail.users.messages.send({
    userId: 'me',
    requestBody: mail,
  }, (err, _res) => {
    if (err) {
      console.log(`The API returned an error: ${err.message || err.toString()}`); // Logging error if any
      return;
    }
    console.log('Message sent successfully'); // Logging success message
  });
}

/**
 * Contains routines for mail delivery with GMail.
 */
export default class Mailer {
  static checkAuth() {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(JSON.parse(content), (auth) => {
          if (auth) {
            console.log('Auth check was successful'); // Logging success message
          }
        });
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err); // Logging error if any
      });
  }

  static buildMessage(dest, subject, message) {
    const senderEmail = process.env.GMAIL_SENDER; // Getting sender email from environment variables
    const msgData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [dest],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject,
      body: message,
    }; // Creating message data

    if (!senderEmail) {
      throw new Error(`Invalid sender: ${senderEmail}`); // Throwing error if sender email is invalid
    }
    if (mimeMessage.validMimeMessage(msgData)) {
      const mimeMsg = mimeMessage.createMimeMessage(msgData); // Creating MIME message
      return { raw: mimeMsg.toBase64SafeString() }; // Returning base64 encoded message
    }
    throw new Error('Invalid MIME message'); // Throwing error if MIME message is invalid
  }

  static sendMail(mail) {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(
          JSON.parse(content),
          (auth) => sendMailService(auth, mail),
        ); // Authorizing and sending mail
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err); // Logging error if any
      });
  }
}
