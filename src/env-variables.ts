import dotenv from 'dotenv'
dotenv.config()

type gmailObject = {
    client_id: string
    project_id: string
    auth_uri: string
    token_uri: string
    auth_provider_x509_cert_url: string
    client_secret: string
    redirect_uri: string
}

export const port: string = process.env.PORT || "4005"
export const NODE_ENV: string = process.env.NODE_ENV || "dev"
export const databaseUrl: string = process.env.DB_URL || ""
export const privateKey: string = process.env.RECAPTCHA_SECRET || ""
export const string_jwt: string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
export const bcryptSalt: string = process.env.BCRYPTSALT || "12"
export const emailPSW: string = process.env.EMAILPSW || ""
export const myEmail: string = process.env.MYEMAIL || ""
export const yourEmail: string = process.env.YOUREMAIL || ""
export const gmailCredentials: gmailObject = {
    client_id: process.env.CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || "",
    project_id: process.env.PROJECT_ID || "",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    redirect_uri: "https://www.misericordiaweb.com"
}
export const gmailTokens = {
    access_token: process.env.ACCESS_TOKEN || "",
    refresh_token: process.env.REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    token_type: 'Bearer',
    expiry_date: 1655855625819
}
