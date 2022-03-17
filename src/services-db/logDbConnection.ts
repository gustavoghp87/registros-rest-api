import { dbClient, logger } from '../server'
import { typeLog, typeLogsObj } from '../models/log'

export class LogDb {

    async Add(log: typeLog, collection: string): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).insertOne(log)
            return true
        } catch (error) {
            console.log("Failed adding logs to db:", error)
            return false
        }
    }

    async Get(collection: string): Promise<typeLog[]|null> {
        try {
            const logs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).find().toArray() as typeLog[]
            return logs            
        } catch (error) {
            console.log(error)
            logger.Add(`Falló Get() logs ${collection}: ${error}`, "error")
            return null
        }
    }

    async GetAll(): Promise<typeLogsObj|null> {
        try {
            const loginLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollLoginLogs).find().toArray() as typeLog[]
            const campaignAssignmentLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignAssignmentLogs).find().toArray() as typeLog[]
            const campaignFinishingLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignFinishingLogs).find().toArray() as typeLog[]
            const territoryChangeLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollTerritoryChangeLogs).find().toArray() as typeLog[]
            const stateOfTerritoryChangeLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollStateOfTerritoryChangeLogs).find().toArray() as typeLog[]
            const errorLogs: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollErrorLogs).find().toArray() as typeLog[]
            const userChanges: typeLog[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollUserChangesLogs).find().toArray() as typeLog[]
            const logs: typeLogsObj = {
                loginLogs,
                campaignAssignmentLogs,
                campaignFinishingLogs,
                territoryChangeLogs,
                stateOfTerritoryChangeLogs,
                errorLogs,
                userChanges
            }
            return logs
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAll() logs: ${error}`, "error")
            return null
        }
    }
}
