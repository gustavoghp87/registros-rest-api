import { google } from 'googleapis'
import { gmailCredentials, sendScope } from './gmail-credentials'

const uriNumber: 0|1 = 1       //  0 production | 1 localhost

export const getGmailUrl = (): void => {
    const { client_secret, client_id, redirect_uris } = gmailCredentials
    // step 1:
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[uriNumber])
    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [sendScope],
        redirect_uri: redirect_uris[uriNumber]
    })
    console.log('\n\n', url, '\n\n')
}

export const getGmailRequest = () => {
    const { client_secret, client_id, redirect_uris } = gmailCredentials
    // step 2:
    const code = ""   // Replace with the code you received from Google
    if (code) {
        const oAuth2Client1 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[uriNumber])
        oAuth2Client1.getToken(code).then(({ tokens }) => {
            console.log('\n\n', tokens, '\n\n')
        })
    }
}
