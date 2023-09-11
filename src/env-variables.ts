import dotenv from 'dotenv'

dotenv.config()

// node
export const environment: string = process.env.ENVIRONMENT || 'dev'
export const port: string = process.env.PORT || '4005'

// mongo
export const databaseUrl: string = process.env.DB_URL || ''
export const databaseUrlTesting: string = process.env.DB_TEST_URL || ''

// bcrypt
export const bcryptSalt: string = process.env.BCRYPTSALT || '12'

// jwt
export const jwtString: string = process.env.STRING_JWT || 'ñmksdfpsdmfbpmfbdf651sdfsdsdASagsdASDG354fab2sdf'

// gmail
export const client_id: string = process.env.CLIENT_ID || ''
export const client_secret: string = process.env.CLIENT_SECRET || ''
export const project_id: string = process.env.PROJECT_ID || ''
export const myEmail: string = process.env.MYEMAIL || ''
export const yourEmail: string = process.env.YOUREMAIL || ''

// google geocoding api
export const googleGeocodingAPIKey: string = process.env.GOOGLE_GEOCODING_CREDENTIAL || ''

// google recaptcha
export const privateKey: string = process.env.RECAPTCHA_SECRET || ''

// open weather api
export const openWeatherToken: string = process.env.OPEN_WEATHER_TOKEN || ''
