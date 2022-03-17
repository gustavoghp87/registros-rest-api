import { dbClient, logger } from '../server'
import { typeLogObj, typeLogsObj } from '../models/log'

export class LogDb {

    async Add(log: typeLogObj, collection: string): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).insertOne(log)
            return true
        } catch (error) {
            console.log("Failed adding logs to db:", error)
            return false
        }
    }

    async Get(collection: string): Promise<typeLogObj[]|null> {
        try {
            const logs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).find().toArray() as typeLogObj[]
            return logs            
        } catch (error) {
            console.log(error)
            logger.Add(`Falló Get() logs ${collection}: ${error}`, "error")
            return null
        }
    }

    async GetAll(): Promise<typeLogsObj|null> {
        try {
            const loginLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollLoginLogs).find().toArray() as typeLogObj[]
            const campaignAssignmentLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignAssignmentLogs).find().toArray() as typeLogObj[]
            const campaignFinishingLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignFinishingLogs).find().toArray() as typeLogObj[]
            const territoryChangeLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollTerritoryChangeLogs).find().toArray() as typeLogObj[]
            const stateOfTerritoryChangeLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollStateOfTerritoryChangeLogs).find().toArray() as typeLogObj[]
            const errorLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollErrorLogs).find().toArray() as typeLogObj[]
            const userChangesLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollUserChangesLogs).find().toArray() as typeLogObj[]
            const appLogs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollAppLogs).find().toArray() as typeLogObj[]
            const logs: typeLogsObj = {
                loginLogs,
                campaignAssignmentLogs,
                campaignFinishingLogs,
                territoryChangeLogs,
                stateOfTerritoryChangeLogs,
                errorLogs,
                userChangesLogs,
                appLogs
            }
            return logs
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAll() logs: ${error}`, "error")
            return null
        }
    }
}
