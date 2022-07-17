import express, { RequestHandler } from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import { port, NODE_ENV } from './env-variables'
import { router as campaignController } from './controllers/campaign-controller'
import { router as emailController } from './controllers/email-controller'
import { router as houseToHouseController } from './controllers/house-to-house-controller'
import { router as geocodingController } from './controllers/geocoding-controller'
import { router as logController } from './controllers/log-controller'
import { router as stateTerritoryController } from './controllers/state-of-territory-controller'
import { router as statisticsController } from './controllers/statistics-controller'
import { router as territoryController } from './controllers/territory-controller'
import { router as tokenController } from './controllers/token-controller'
import { router as userController } from './controllers/user-controller'
import { DbConnection } from './services-db/_dbConnection'
import { socketConnection } from './services/broadcast-services'
import { Logger, app as appType } from './services/log-services'

export const isProduction: boolean = NODE_ENV !== "dev"
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
app.use('/api/campaign', campaignController)
app.use('/api/email', emailController)
app.use('/api/log', logController)
app.use('/api/house-to-house', houseToHouseController)
app.use('/api/geocoding', geocodingController)
app.use('/api/state-territory', stateTerritoryController)
app.use('/api/statistic', statisticsController)
app.use('/api/territory', territoryController)
app.use('/api/token', tokenController)
app.use('/api/user', userController)

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection(isProduction)
    setTimeout(() => { logger.Add(`Inicia App`, appType) }, 5000)
})
