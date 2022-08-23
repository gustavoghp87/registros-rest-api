import express, { RequestHandler } from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import * as controllers from './controllers'
import { DbConnection } from './services-db/_dbConnection'
import { socketConnection } from './services/broadcast-services'
import { Logger } from './services/log-services'
import { environment, port } from './env-variables'

export const isProduction: boolean = environment === 'prod'
export const testingDb: boolean = !isProduction
export const accessTokensExpiresIn: string = '2160h'  // 90 days
export const domain: string = "https://www.misericordiaweb.com"
export const testingDomain: string = "http://localhost:3000"
export const dbClient: DbConnection = new DbConnection(testingDb)
export const logger: Logger = new Logger()

const app = express()
app.use(cors({ origin: isProduction ? [domain] : [domain, testingDomain] }))
app.use(express.json() as RequestHandler)
app.use(express.urlencoded({ extended: false }) as RequestHandler)
app.use(morgan('dev') as RequestHandler)
app.use(express.static(path.join(__dirname, 'frontend-src')))
app.use(express.static(path.join(__dirname, 'build')))
app.use('/api/campaign', controllers.campaignController)
app.use('/api/congregation', controllers.congregationController)
app.use('/api/email', controllers.emailController)
app.use('/api/log', controllers.logController)
app.use('/api/house-to-house', controllers.houseToHouseController)
app.use('/api/geocoding', controllers.geocodingController)
app.use('/api/telephonic', controllers.telephonicController)
app.use('/api/user', controllers.userController)
app.use('/api/weather', controllers.weatherController)

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection(isProduction)
})
