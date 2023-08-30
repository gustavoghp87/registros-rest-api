import { DbConnection } from './services-db/_dbConnection'
import { environment, port } from './env-variables'
import { Logger } from './services/log-services'
import { setUpUser } from './services/set-up-user-service'
import { socketConnection } from './services/broadcast-services'
import * as controllers from './controllers'
import cors from 'cors'
import express, { RequestHandler } from 'express'
import morgan from 'morgan'
import path from 'path'

export const isProduction = environment === 'prod'
export const testingDb = !isProduction
export const accessTokensExpiresIn = '2160h'  // 90 days
export const recoveryTokensExpiresIn = 24*60*60*1000  // 24 hs
export const domain = "https://www.misericordiaweb.com"
export const testingDomain = "http://localhost:3000"
export const dbClient = new DbConnection(testingDb)
export const logger = new Logger()
export const emailPatter = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const app = express()
app.use(cors({ origin: isProduction ? [domain] : [domain, testingDomain] }))
app.use(express.json() as RequestHandler)
app.use(express.urlencoded({ extended: false }) as RequestHandler)
app.use(morgan('dev') as RequestHandler)
app.use(express.static(path.join(__dirname, 'build')))
//app.use('/api/campaign', setUpUser, controllers.campaignController)
app.use('/api/board', setUpUser, controllers.boardController)
app.use('/api/config', setUpUser, controllers.configController)
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
