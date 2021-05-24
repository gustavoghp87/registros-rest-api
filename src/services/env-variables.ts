import dotenv from 'dotenv'
dotenv.config()

export const port = process.env.PORT || 4005
export const NODE_ENV = process.env.NODE_ENV || "dev"
export const databaseUrl = process.env.DB_URL || ""
export const privateKey = process.env.RECAPTCHA_SECRET || ""
export const string_jwt = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
export const emailPSW = process.env.EMAILPSW || ""
export const myEmail = process.env.myEmail || ""
export const yourEmail = process.env.yourEmail || ""
