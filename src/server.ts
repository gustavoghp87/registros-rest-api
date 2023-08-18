import express, { RequestHandler } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import * as controllers from './controllers'
import { environment, port } from './env-variables'
import { DbConnection } from './services-db/_dbConnection'
import { socketConnection } from './services/broadcast-services'
import { Logger } from './services/log-services'
import { setUpUser } from './services/set-up-user-service'

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
app.use(express.static(path.join(__dirname, 'build')))
//app.use('/api/campaign', setUpUser, controllers.campaignController)
app.use('/api/board', setUpUser, controllers.boardController)
app.use('/api/email', setUpUser, controllers.emailController)
app.use('/api/log', setUpUser, controllers.logController)
app.use('/api/house-to-house', setUpUser, controllers.houseToHouseController)
app.use('/api/geocoding', setUpUser, controllers.geocodingController)
app.use('/api/telephonic', setUpUser, controllers.telephonicController)
app.use('/api/user', setUpUser, controllers.userController)
app.use('/api/weather', setUpUser, controllers.weatherController)

export const server = app.listen(port, () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection(isProduction)
})
