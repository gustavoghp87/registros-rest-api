import { dbClient, isProduction } from '../server'
import { LogDb } from '../services-db/logDbConnection'
import { getActivatedAdminByAccessTokenService } from './user-services'
import { typeLog, typeLogsObj } from '../models/log'
import { typeUser } from '../models/user'

type typeLogType = "login" | "territoryChange" | "stateOfTerritoryChange" | "campaignAssignment" | "campaignFinishing" | "error" | "socketError" | "userChanges"
const login: typeLogType = "login"
const territoryChange: typeLogType = "territoryChange"
const stateOfTerritoryChange: typeLogType = "stateOfTerritoryChange"
const campaignAssignment: typeLogType = "campaignAssignment"
const campaignFinishing: typeLogType = "campaignFinishing"
const error: typeLogType = "error"
const socketError: typeLogType = "socketError"
const userChanges: typeLogType = "userChanges"

export class Logger {

    private LogDbConnection: LogDb

    constructor() {
        this.LogDbConnection = new LogDb()
    }

    public async Add(logText: string, type: typeLogType): Promise<boolean> {
        const collection: string = this.GetCollection(type)
        if (!collection || !logText) return false
        const newDateTs = isProduction ? new Date().getTime() - 3*60*60*1000 : new Date().getTime()
        const newDate = new Date().setTime(newDateTs)
        logText = new Date(newDate).toLocaleString("es-AR") + " | " + logText
        if (!isProduction) {
            console.log(logText)
            return true
        }
        const log: typeLog = {
            timestamp: + new Date(),
            logText
        }
        const success: boolean = await this.LogDbConnection.Add(log, collection)
        return success
    }

    public async Get(type: typeLogType, token: string): Promise<typeLog[]|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user) return null
        const collection: string = this.GetCollection(type)
        if (!collection) return null
        const logs: typeLog[]|null = await this.LogDbConnection.Get(collection)
        return logs
    }

    public async GetAll(token: string): Promise<typeLogsObj|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user || user.email !== 'ghp.2120@gmail.com') return null
        const logs: typeLogsObj|null = await this.LogDbConnection.GetAll()
        return logs
    }

    private GetCollection(type: typeLogType): string {
        let collection: string
        switch (type) {
            case login: collection = dbClient.CollLoginLogs; break;
            case territoryChange: collection = dbClient.CollTerritoryChangeLogs; break;
            case stateOfTerritoryChange: collection = dbClient.CollStateOfTerritoryChangeLogs; break;
            case campaignAssignment: collection = dbClient.CollCampaignAssignmentLogs; break;
            case campaignFinishing: collection = dbClient.CollCampaignFinishingLogs; break;
            case error: collection = dbClient.CollErrorLogs; break;
            case socketError: collection = dbClient.CollSocketErrorLogs; break;
            case userChanges: collection = dbClient.CollUserChangesLogs; break;
            default: collection = ""; break;
        }
        return collection
    }
}