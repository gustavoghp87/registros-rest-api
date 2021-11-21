import express, { RequestHandler } from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import { port, NODE_ENV } from './env-variables'
import { router as userController } from './controllers/user-controller'
import { router as tokenController } from './controllers/token-controller'
import { router as territoryController } from './controllers/territory-controller'
import { router as stateTerritoryController } from './controllers/state-territory-controller'
import { router as statisticsController } from './controllers/statistics-controller'
import { DbConnection } from './services-db/_dbConnection'
import { socketConnection } from './services/broadcast-services'
import { TerritoryDb } from './services-db/territoryDbConnection'

export let testingDb: boolean = false
export let maintenanceMode: boolean = false
export const accessTokensExpiresIn = '2160h'  // 90 days

export const domain: string = "https://www.misericordiaweb.com"
export const testingDomain: string = "http://localhost:3000"

if (NODE_ENV !== "dev") { testingDb = false; maintenanceMode = false }
export const dbClient = new DbConnection(testingDb)

const app = express()
app.use(cors({ origin: [`${domain}`, `${testingDomain}`] }))
app.use(express.json() as RequestHandler)
app.use(express.urlencoded({ extended: false }) as RequestHandler)
app.use(morgan('dev') as RequestHandler)
app.use(express.static(path.join(__dirname, 'frontend-src')))
app.use(express.static(path.join(__dirname, 'build')))
app.use('/api/user', userController)
app.use('/api/token', tokenController)
app.use('/api/territory', territoryController)
app.use('/api/state-territory', stateTerritoryController)
app.use('/api/statistic', statisticsController)

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection()
    // setTimeout(async () => {
    //     await new TerritoryDb().ChangeStateForIsFinished()
    // }, 2000);
})
