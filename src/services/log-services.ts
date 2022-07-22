import { dbClient, isProduction } from '../server'
import { getActivatedAdminByAccessTokenService } from './user-services'
import { LogDb } from '../services-db/logDbConnection'
import { typeCollection } from '../services-db/_dbConnection'
import { typeLogObj, typeLogsObj, typeUser } from '../models'

type typeLog = 'login' | 'territoryChange' | 'stateOfTerritoryChange' | 'campaignAssignment' | 'campaignFinishing' | 'emailError' | 'error' | 'socketError' | 'userChanges' | 'app'
export const login: typeLog = 'login'
export const territoryChange: typeLog = 'territoryChange'
export const stateOfTerritoryChange: typeLog = 'stateOfTerritoryChange'
export const campaignAssignment: typeLog = 'campaignAssignment'
export const campaignFinishing: typeLog = 'campaignFinishing'
export const emailError: typeLog = 'emailError'
export const generalError: typeLog = 'error'
export const socketError: typeLog = 'socketError'
export const userChanges: typeLog = 'userChanges'
export const app: typeLog = 'app'

export class Logger {

    private LogDbConnection: LogDb

    constructor() {
        this.LogDbConnection = new LogDb()
    }

    public async Add(logText: string, type: typeLog): Promise<boolean> {
        const collection: typeCollection = this.GetCollection(type)
        if (!collection || !logText) return false
        let newDateTs: number = isProduction ? new Date().getTime() - 3*60*60*1000 : new Date().getTime()
        if (logText === "Inicia App") newDateTs -= 5000
        const newDate = new Date().setTime(newDateTs)
        logText = new Date(newDate).toLocaleString('es-AR') + " | " + logText
        if (!isProduction) {
            console.log(logText)
            return true
        }
        const log: typeLogObj = {
            timestamp: + new Date(),
            logText
        }
        const success: boolean = await this.LogDbConnection.Add(log, collection)
        return success
    }

    public async Get(type: typeLog, token: string): Promise<typeLogObj[]|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user) return null
        const collection: string = this.GetCollection(type)
        if (!collection) return null
        const logs: typeLogObj[]|null = await this.LogDbConnection.Get(collection)
        return logs
    }

    public async GetAll(token: string): Promise<typeLogsObj|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user) return null
        const logs: typeLogsObj|null = await this.LogDbConnection.GetAll()
        return logs
    }

    private GetCollection(type: typeLog): typeCollection {
        let collection: typeCollection
        switch (type) {
            case login: collection = dbClient.CollLoginLogs; break;
            case territoryChange: collection = dbClient.CollTerritoryChangeLogs; break;
            case stateOfTerritoryChange: collection = dbClient.CollStateOfTerritoryChangeLogs; break;
            case campaignAssignment: collection = dbClient.CollCampaignAssignmentLogs; break;
            case campaignFinishing: collection = dbClient.CollCampaignFinishingLogs; break;
            case generalError: collection = dbClient.CollErrorLogs; break;
            case socketError: collection = dbClient.CollSocketErrorLogs; break;
            case userChanges: collection = dbClient.CollUserChangesLogs; break;
            case app: collection = dbClient.CollAppLogs; break;
            default: collection = dbClient.CollErrorLogs; break;
        }
        return collection
    }
}
