import express, { RequestHandler } from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import { port, environment } from './env-variables'
import * as controllers from './controllers'
import { DbConnection } from './services-db/_dbConnection'
import { socketConnection } from './services/broadcast-services'
import { Logger, app as appType } from './services/log-services'

import { DbConnection as DbConnection1 } from './services-db1/_dbConnection'
import { getUsersService } from './services/user-services'
import { typeCampaignPack, typeEmailObj, typeHousehold, typeHTHTerritory, typeLogsObj, typeStateOfTerritory, typeTerritoryNumber, typeUser} from './models'
import { typeCampaignPack as typeCampaignPack1, typeEmailObj as typeEmailObj1, typeHTHTerritory as typeHTHTerritory1,
    typeLogObj as typeLogObj1, typeTelephonicTerritory, typeLogsPackage as typeLog1, typeUser as typeUser1} from './models1'
import { getCampaignPacksService } from './services/campaign-services'
import { getAllHouseholdsService } from './services/territory-services'
import { getStateOfTerritoriesService } from './services/state-of-territory-services'
import { getHTHTerritoriesService } from './services/house-to-house-services'
import { getEmailObject } from './services/email-services'



export const isProduction: boolean = true
export const testingDb: boolean = !isProduction
export const accessTokensExpiresIn: string = '2160h'  // 90 days
export const domain: string = "https://www.misericordiaweb.com"
export const testingDomain: string = "http://localhost:3000"
export const dbClient: DbConnection = new DbConnection(false)
export const dbClient1: DbConnection1 = new DbConnection1(false)
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
app.use('/api/state-territory', controllers.stateTerritoryController)
app.use('/api/statistic', controllers.statisticsController)
app.use('/api/territory', controllers.territoryController)
app.use('/api/token', controllers.tokenController)
app.use('/api/user', controllers.userController)

export const server = app.listen(port, async () => {
    console.log(`\n\n\nListening on port ${port}`)
    socketConnection(isProduction)
    setTimeout(async () => {
        logger.Add(`Inicia App`, appType)

        /////////////////////////////////////////////////////////////////////////////////////////////////
        const updateDb: boolean = true

        if (!updateDb) return

        const users: typeUser[]|null = await getUsersService("")
        users?.reverse()
        users?.forEach(async (x: typeUser) => {
            const newUser: typeUser1 = {
                email: x.email,
                group: x.group,
                id: +new Date(),
                isActive: x.estado,
                password: x.password,
                phoneAssignments: x.asign || [],
                recoveryOptions: x.recoveryOptions || [],
                role: x.role,
                tokenId: x.tokenId || 1
            }
            await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollUsers).insertOne(newUser)
            console.log("User", x.email)
        })

        const households: typeHousehold[]|null = await getAllHouseholdsService()
        const stateOfTerritories: typeStateOfTerritory[]|null = await getStateOfTerritoriesService("")
        for (let i = 1; i < 57; i++) {
            const newTerritory: typeTelephonicTerritory = {
                households: [],
                stateOfTerritory: {
                    isFinished: false,
                    resetDates: []
                },
                territoryNumber: i.toString() as typeTerritoryNumber
            }
            households?.forEach(x => {
                if (x.territorio === i.toString()) newTerritory.households.push({
                    address: x.direccion,
                    block: x.manzana,
                    callingState: x.estado,
                    dateOfLastCall: x.fechaUlt && x.fechaUlt !== "1" ? parseInt(x.fechaUlt) : 0,
                    householdId: parseInt(x.inner_id),
                    isAssigned: x.asignado || false,
                    notSubscribed: x.noAbonado || false,
                    phoneNumber: x.telefono,
                })
            })
            stateOfTerritories?.forEach(x => {
                if (x.territorio === i.toString()) {
                    newTerritory.stateOfTerritory.isFinished = x.isFinished
                    newTerritory.stateOfTerritory.resetDates = x.resetDate || []
                }
            })
            await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollTelephonicTerritories).insertOne(newTerritory)
            console.log("Telephonic household", i)
        }

        const logs: typeLogsObj|null = await logger.GetAll("")
        const newCampaignLogs: typeLog1 = {
            logs: [],
            type: 'CampaignLogs'
        }
        const newErrorLogs: typeLog1 = {
            logs: [],
            type: 'ErrorLogs'
        }
        const newHouseToHouseAdminLogs: typeLog1 = {
            logs: [],
            type: 'HouseToHouseAdminLogs'
        }
        const newHouseToHouseLogs: typeLog1 = {
            logs: [],
            type: 'HouseToHouseLogs'
        }
        const newLoginLogs: typeLog1 = {
            logs: [],
            type: 'LoginLogs'
        }
        const newTelephonicLogs: typeLog1 = {
            logs: [],
            type: 'TelephonicLogs'
        }
        const newTelephonicStateLogs: typeLog1 = {
            logs: [],
            type: 'TelephonicStateLogs'
        }
        const newUserLogs: typeLog1 = {
            logs: [],
            type: 'UserLogs'
        }
        logs?.campaignAssignmentLogs.forEach(x => newCampaignLogs.logs.push(x))
        logs?.campaignFinishingLogs.forEach(x => newCampaignLogs.logs.push(x))
        newCampaignLogs.logs.sort((a: typeLogObj1, b: typeLogObj1) => a.timestamp - b.timestamp)
        logs?.errorLogs.forEach(x => newErrorLogs.logs.push(x))
        logs?.loginLogs.forEach(x => newLoginLogs.logs.push(x))
        logs?.stateOfTerritoryChangeLogs.forEach(x => newTelephonicStateLogs.logs.push(x))
        logs?.territoryChangeLogs.forEach(x => newTelephonicLogs.logs.push(x))
        logs?.userChangesLogs.forEach(x => newUserLogs.logs.push(x))
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newCampaignLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newErrorLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newHouseToHouseAdminLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newHouseToHouseLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newLoginLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newTelephonicLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newTelephonicStateLogs)
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollLogs).insertOne(newUserLogs)
        console.log("Logs")

        const campaignPacks: typeCampaignPack[]|null = await getCampaignPacksService("")
        if (campaignPacks) {
            campaignPacks.sort((a: typeCampaignPack, b: typeCampaignPack) => a.id - b.id)
            for (let i = 0; i < campaignPacks.length; i++) {
                const x = campaignPacks[i]
                const newCampaignPackage: typeCampaignPack1 = {
                    assignedTo: x.asignado || "",
                    calledPhones: x.llamados || [],
                    from: x.desde,
                    id: x.id,
                    isAccessible: x.accessible || false,
                    isFinished: x.terminado || false,
                    to: x.al
                }
                await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollCampaigns).insertOne(newCampaignPackage)
                console.log("Campaign", i)
            }
        }

        const hthTerritories = await getHTHTerritoriesService("")
        hthTerritories?.forEach(async (x: typeHTHTerritory) => {
            const newHthTerritory: typeHTHTerritory1 = {
                map: x.map,
                territoryNumber: x.territory
            }
            await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollHTHTerritories).insertOne(newHthTerritory)
            console.log("HTH", x.territory)
        })

        const x: typeEmailObj|null = await getEmailObject()
        const newEmailObject: typeEmailObj1 = {
            accessToken: x?.accessToken || "",
            lastEmailDate: parseInt(x?.lastEmail || "") || 0,
            refreshToken: x?.refreshToken || ""
        }
        await dbClient1.Client.db(dbClient1.DbMW).collection(dbClient1.CollEmails).insertOne(newEmailObject)
        console.log("Emails")

    }, 10000)
})
