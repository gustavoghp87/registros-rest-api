import dotenv from 'dotenv'
dotenv.config()

export const port: string = process.env.PORT || "4005"
export const NODE_ENV: string = process.env.NODE_ENV || "dev"
export const databaseUrl: string = process.env.DB_URL || ""
export const privateKey: string = process.env.RECAPTCHA_SECRET || ""
export const string_jwt: string = process.env.STRING_JWT || "ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf"
export const bcryptSalt: string = process.env.BCRYPTSALT || "12"
export const emailPSW: string = process.env.EMAILPSW || ""
export const myEmail: string = process.env.MYEMAIL || ""
export const yourEmail: string = process.env.YOUREMAIL || ""
