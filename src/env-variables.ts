import dotenv from 'dotenv'

dotenv.config()
export const access_token: string = process.env.ACCESS_TOKEN || ""
export const bcryptSalt: string = process.env.BCRYPTSALT || "12"
export const client_id: string = process.env.CLIENT_ID || ""
export const client_secret: string = process.env.CLIENT_SECRET || ""
export const databaseUrl: string = process.env.DB_URL || ""
export const googleGeocodingAPIKey: string = process.env.GOOGLE_GEOCODING_CREDENTIAL || ""
export const myEmail: string = process.env.MYEMAIL || ""
export const NODE_ENV: string = process.env.NODE_ENV || "dev"
export const port: string = process.env.PORT || "4005"
export const privateKey: string = process.env.RECAPTCHA_SECRET || ""
export const project_id: string = process.env.PROJECT_ID || ""
export const refresh_token: string = process.env.REFRESH_TOKEN || ""
export const string_jwt: string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
export const yourEmail: string = process.env.YOUREMAIL || ""
export const googleSiteUrl: string = process.env.GOOGLE_SITE_URL || ""
