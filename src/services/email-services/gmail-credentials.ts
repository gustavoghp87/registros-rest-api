import { Credentials } from 'google-auth-library'
import { access_token, client_id, client_secret, project_id, refresh_token } from '../../env-variables'
import { domain, testingDomain } from '../../server'

type gmailObject = {
    auth_provider_x509_cert_url: string
    auth_uri: string
    client_id: string
    client_secret: string
    project_id: string
    redirect_uris: string[]
    token_uri: string
}

export const composeScope: string = 'https://www.googleapis.com/auth/gmail.compose'
export const sendScope: string = 'https://www.googleapis.com/auth/gmail.send'

export const gmailCredentials: gmailObject = {
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    client_id,
    client_secret,
    project_id,
    redirect_uris: [domain, testingDomain],
    token_uri: "https://oauth2.googleapis.com/token"
}

export const gmailTokens: Credentials = {
    access_token,
    expiry_date: 1655855625819,
    refresh_token,
    scope: sendScope,
    token_type: 'Bearer'
}