import { dbClient, logger } from '../server'
import { generalError } from '../services/log-services'
import { typeCollection } from './_dbConnection'
import { typeLogObj, typeLogsObj } from '../models/log'

export class LogDb {

    async Add(log: typeLogObj, collection: typeCollection): Promise<boolean> {
        try {
            const isAlreadySaved: boolean = collection !== 'TerritoryChangeLogs' && await this.IsAlreadySaved(log, collection)
            if (isAlreadySaved) {
                console.log("Se evitó un repetido")
                return true
            }
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
            logger.Add(`Falló Get() logs ${collection}: ${error}`, generalError)
            return null
        }
    }

    async GetAll(): Promise<typeLogsObj|null> {
        try {
            const loginLogs: typeLogObj[] =
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollLoginLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const campaignAssignmentLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignAssignmentLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const campaignFinishingLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollCampaignFinishingLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const territoryChangeLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollTerritoryChangeLogs).find().sort({ timestamp: 'descending' }).limit(100).toArray() as typeLogObj[]
            const stateOfTerritoryChangeLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollStateOfTerritoryChangeLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const errorLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollErrorLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const userChangesLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollUserChangesLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
            const appLogs: typeLogObj[] = 
                await dbClient.Client.db(dbClient.DbMWLogs).collection(dbClient.CollAppLogs).find().sort({ timestamp: 'descending' }).toArray() as typeLogObj[]
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
            logger.Add(`Falló GetAll() logs: ${error}`, generalError)
            return null
        }
    }

    private async IsAlreadySaved(log: typeLogObj, collection: string): Promise<boolean> {
        try {
            const logObj: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).find({ logText: log.logText })?.toArray() as typeLogObj[]
            if (logObj && logObj.length) {
                console.log("Se evitó un duplicado simple: " + log.logText)
                return true
            }
    
            const logObjs: typeLogObj[] = await dbClient.Client.db(dbClient.DbMWLogs).collection(collection).find({
                logText: {
                    $regex: `/.*${log.logText.split(" | ")[1]}.*/`
                }
            }).toArray() as typeLogObj[]
            if (logObjs && logObjs.length) {
                logObjs.forEach((logObj0: typeLogObj) => {
                    if (logObj0 && log.timestamp - logObj0.timestamp < 200) {
                        console.log("Se evitó un duplicado por regex: " + log.logText)
                        return true
                    }
                })
            }

            return false
        } catch (error) {
            console.log(`Falló IsAlreadySaved() ${log.logText}: ${error}`)
            return false
        }

        // First, create the index:

        //     db.users.createIndex( { "username": "text" } )

        // Then, to search:

        //     db.users.find( { $text: { $search: "son" } } )

        // Benchmarks (~150K documents):

        // Regex (other answers) => 5.6-6.9 seconds
        // Text Search => .164-.201 seconds
    }
}
