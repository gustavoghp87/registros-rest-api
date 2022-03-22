import { dbClient, isProduction } from '../server'
import { LogDb } from '../services-db/logDbConnection'
import { getActivatedAdminByAccessTokenService } from './user-services'
import { typeLogObj, typeLogsObj } from '../models/log'
import { typeUser } from '../models/user'

type typeLog = "login" | "territoryChange" | "stateOfTerritoryChange" | "campaignAssignment" | "campaignFinishing" | "error" | "socketError" | "userChanges" | "app"
const login: typeLog = "login"
const territoryChange: typeLog = "territoryChange"
const stateOfTerritoryChange: typeLog = "stateOfTerritoryChange"
const campaignAssignment: typeLog = "campaignAssignment"
const campaignFinishing: typeLog = "campaignFinishing"
const error: typeLog = "error"
const socketError: typeLog = "socketError"
const userChanges: typeLog = "userChanges"
const app: typeLog = "app"

export class Logger {

    private LogDbConnection: LogDb

    constructor() {
        this.LogDbConnection = new LogDb()
    }

    public async Add(logText: string, type: typeLog): Promise<boolean> {
        const collection: string = this.GetCollection(type)
        if (!collection || !logText) return false
        let newDateTs: number = isProduction ? new Date().getTime() - 3*60*60*1000 : new Date().getTime()
        if (logText === "Inicia App") newDateTs -= 5000
        const newDate = new Date().setTime(newDateTs)
        logText = new Date(newDate).toLocaleString("es-AR") + " | " + logText
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
        if (logs && logs.territoryChangeLogs.length > 100) logs.territoryChangeLogs = logs.territoryChangeLogs.slice(0, 100)
        return logs
    }

    private GetCollection(type: typeLog): string {
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
            case app: collection = dbClient.CollAppLogs; break;
            default: collection = ""; break;
        }
        return collection
    }
}