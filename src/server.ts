import express, { RequestHandler } from 'express'
import { port, NODE_ENV } from './env-variables'
import { DbConnection } from './services-db/_dbConnection'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import { router as userController } from './controllers/user-controller'
import { router as territoryController } from './controllers/territory-controller'
import { router as stateTerritoryController } from './controllers/state-territory-controller'
import { router as statisticsController } from './controllers/statistics-controller'
import { socketConnection } from './services/broadcast-services'

export let testingDb: boolean = true
export let maintenanceMode: boolean = false

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
app.use('/api/users', userController)
app.use('/api/territories', territoryController)
app.use('/api/state-territories', stateTerritoryController)
app.use('/api/statistics', statisticsController)

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection()
})
