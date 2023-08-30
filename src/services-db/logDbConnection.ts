import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { InsertOneResult } from 'mongodb'
import { typeLogsPackage, typeLogObj, typeAllLogsObj, typeLogType } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollLogs)

export class LogDb {

    private CampaignLogs: typeLogType = 'CampaignLogs'
    private ConfigLogs: typeLogType = 'ConfigLogs'
    private ErrorLogs: typeLogType = 'ErrorLogs'
    private HouseToHouseAdminLogs: typeLogType = 'HouseToHouseAdminLogs'
    private HouseToHouseLogs: typeLogType = 'HouseToHouseLogs'
    private LoginLogs: typeLogType = 'LoginLogs'
    private TelephonicLogs: typeLogType = 'TelephonicLogs'
    private TelephonicStateLogs: typeLogType = 'TelephonicStateLogs'
    private UserLogs: typeLogType = 'UserLogs'

    async Add(congregation: number, log: typeLogObj, type: typeLogType): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            //const isAlreadySaved: boolean = collection !== 'TerritoryChangeLogs' && await this.IsAlreadySaved(log, collection)
            // if (isAlreadySaved) {
            //     ("Se evitó un repetido")
            //     return true
            // }
            await getCollection().updateOne(
                { congregation, type },
                { $push: { logs: log } }
            )
            return true
        } catch (error) {
            console.log("\n\nFailed adding logs to db:", error, "\n\n")
            return false
        }
    }
    async Get(congregation: number, type: typeLogType): Promise<typeLogsPackage|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const logs = await getCollection().findOne({ congregation, type }) as unknown as typeLogsPackage
            return logs
        } catch (error) {
            logger.Add(congregation, `Falló Get() logs ${type}: ${error}`, errorLogs)
            return null
        }
    }
    async Genesys(congregation: number): Promise<boolean> {
        const a = [this.CampaignLogs, this.ConfigLogs, this.ErrorLogs, this.HouseToHouseAdminLogs, this.HouseToHouseLogs, this.LoginLogs, this.TelephonicLogs, this.TelephonicStateLogs, this.UserLogs]
        let result: InsertOneResult|null = null
        for (let i = 0; i < a.length; i++) {
            const logType = a[i]
            const x = {
                logs: [],
                type: logType,
                congregation
            }
            result = await getCollection().insertOne(x)
            console.log(result);
        }
        return !!result
    }
    async GetAll(congregation: number): Promise<typeAllLogsObj|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const campaignLogs = await getCollection().findOne({ congregation, type: this.CampaignLogs }) as unknown as typeLogsPackage
            const configLogs = await getCollection().findOne({ congregation, type: this.ConfigLogs }) as unknown as typeLogsPackage
            const errorLogs = await getCollection().findOne({ congregation, type: this.ErrorLogs }) as unknown as typeLogsPackage
            const houseToHouseAdminLogs = await getCollection().findOne({ congregation, type: this.HouseToHouseAdminLogs }) as unknown as typeLogsPackage
            const houseToHouseLogs = await getCollection().findOne({ congregation, type: this.HouseToHouseLogs }) as unknown as typeLogsPackage
            const loginLogs = await getCollection().findOne({ congregation, type: this.LoginLogs }) as unknown as typeLogsPackage
            const telephonicLogs = await getCollection().findOne({ congregation, type: this.TelephonicLogs }) as unknown as typeLogsPackage
            const telephonicStateLogs = await getCollection().findOne({ congregation, type: this.TelephonicStateLogs }) as unknown as typeLogsPackage
            const userLogs = await getCollection().findOne({ congregation, type: this.UserLogs }) as unknown as typeLogsPackage
            return {
                campaignLogs,
                configLogs,
                errorLogs,
                houseToHouseAdminLogs,
                houseToHouseLogs,
                loginLogs,
                telephonicLogs,
                telephonicStateLogs,
                userLogs
            }
        } catch (error) {
            logger.Add(congregation, `Falló GetAll() logs: ${error}`, errorLogs)
            return null
        }
    }
    // private async IsAlreadySaved(log: typeLogObj, collection: string): Promise<boolean> {
    //     try {
    //         const logObj: typeLogObj = await getCollection().findOne({ logText: log.logText }) as typeLogObj
    //         if (logObj) {
    //             ("Se evitó un duplicado simple: " + log.logText)
    //             return true
    //         }
    
    //         const logObjs: typeLogObj[] = await getCollection().find({
    //             logText: {
    //                 $regex: `/.*${log.logText.split(" | ")[1]}.*/`
    //             }
    //         }).toArray() as typeLogObj[]
    //         if (logObjs && logObjs.length) {
    //             logObjs.forEach((logObj0: typeLogObj) => {
    //                 if (logObj0 && log.timestamp - logObj0.timestamp < 200) {
    //                     ("Se evitó un duplicado por regex: " + log.logText)
    //                     return true
    //                 }
    //             })
    //         }

    //         return false
    //     } catch (error) {
    //         (`Falló IsAlreadySaved() ${log.logText}: ${error}`)
    //         return false
    //     }

    // }
}

// First, create the index:

//     db.users.createIndex( { "username": "text" } )

// Then, to search:

//     db.users.find( { $text: { $search: "son" } } )

// Benchmarks (~150K documents):

// Regex (other answers) => 5.6-6.9 seconds
// Text Search => .164-.201 seconds
