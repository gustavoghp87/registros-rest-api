import { Credentials } from 'google-auth-library'
import { access_token, client_id, client_secret, project_id, refresh_token } from '../../env-variables'
import { domain, testingDomain } from '../../server'
import { GetGmailTokensService } from './email-services'

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
// https://mail.google.com/ (includes any usage of IMAP, SMTP, and POP3 protocols)
// https://www.googleapis.com/auth/gmail.readonly
// https://www.googleapis.com/auth/gmail.metadata
// https://www.googleapis.com/auth/gmail.modify
// https://www.googleapis.com/auth/gmail.insert
// https://www.googleapis.com/auth/gmail.compose
// https://www.googleapis.com/auth/gmail.settings.basic
// https://www.googleapis.com/auth/gmail.settings.sharing

export const gmailCredentials: gmailObject = {
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    client_id,
    client_secret,
    project_id,
    redirect_uris: [domain, testingDomain],
    token_uri: "https://oauth2.googleapis.com/token"
}

export const getGmailCredentialsService = async (): Promise<Credentials|null> => {
    const tokens: Credentials|null = await GetGmailTokensService()
    if (!tokens || !tokens.access_token || !tokens.refresh_token) return null
    return {
        access_token: tokens.access_token,
        expiry_date: 1657835423010,
        refresh_token: tokens.refresh_token,
        scope: sendScope,
        token_type: 'Bearer'
    }
}