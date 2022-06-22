
import { google } from 'googleapis'
import { gmailCredentials } from '../../env-variables'

const { client_secret, client_id, redirect_uri } = gmailCredentials

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)

const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send']

const url = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: GMAIL_SCOPES,
})

console.log('Authorize this app by visiting this url and get the code from url parameter:', url)




// Replace with the code you received from Google
const code = ""

const oAuth2Client1 = new google.auth.OAuth2(client_id, client_secret, redirect_uri)

oAuth2Client1.getToken(code).then(({ tokens }) => {
    console.log("\n\n")
    console.log(tokens)
    console.log("\n\n")
})
