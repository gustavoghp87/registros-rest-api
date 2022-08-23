import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeLogsPackage, typeLogObj, typeAllLogsObj, typeLogType } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollLogs)

export class LogDb {

    private CampaignLogs: typeLogType = 'CampaignLogs'
    private ErrorLogs: typeLogType = 'ErrorLogs'
    private HouseToHouseAdminLogs: typeLogType = 'HouseToHouseAdminLogs'
    private HouseToHouseLogs: typeLogType = 'HouseToHouseLogs'
    private LoginLogs: typeLogType = 'LoginLogs'
    private TelephonicLogs: typeLogType = 'TelephonicLogs'
    private TelephonicStateLogs: typeLogType = 'TelephonicStateLogs'
    private UserLogs: typeLogType = 'UserLogs'

    async Add(log: typeLogObj, type: typeLogType): Promise<boolean> {
        try {
            //const isAlreadySaved: boolean = collection !== 'TerritoryChangeLogs' && await this.IsAlreadySaved(log, collection)
            // if (isAlreadySaved) {
            //     console.log("Se evitó un repetido")
            //     return true
            // }
            await getCollection().updateOne(
                { type },
                { $push: { logs: log } }
            )
            return true
        } catch (error) {
            console.log("Failed adding logs to db:", error)
            return false
        }
    }
    async Get(type: typeLogType): Promise<typeLogsPackage|null> {
        try {
            const logs: typeLogsPackage = await getCollection().findOne({ type }) as typeLogsPackage
            return logs
        } catch (error) {
            console.log(error)
            logger.Add(`Falló Get() logs ${type}: ${error}`, errorLogs)
            return null
        }
    }
    async GetAll(): Promise<typeAllLogsObj|null> {
        try {
            const campaignLogs: typeLogsPackage = await getCollection().findOne({ type: this.CampaignLogs }) as typeLogsPackage
            const errorLogs: typeLogsPackage = await getCollection().findOne({ type: this.ErrorLogs }) as typeLogsPackage
            const houseToHouseAdminLogs: typeLogsPackage = await getCollection().findOne({ type: this.HouseToHouseAdminLogs }) as typeLogsPackage
            const houseToHouseLogs: typeLogsPackage = await getCollection().findOne({ type: this.HouseToHouseLogs }) as typeLogsPackage
            const loginLogs: typeLogsPackage = await getCollection().findOne({ type: this.LoginLogs }) as typeLogsPackage
            const telephonicLogs: typeLogsPackage = await getCollection().findOne({ type: this.TelephonicLogs }) as typeLogsPackage
            const telephonicStateLogs: typeLogsPackage = await getCollection().findOne({ type: this.TelephonicStateLogs }) as typeLogsPackage
            const userLogs: typeLogsPackage = await getCollection().findOne({ type: this.UserLogs }) as typeLogsPackage
            return {
                campaignLogs,
                errorLogs,
                houseToHouseAdminLogs,
                houseToHouseLogs,
                loginLogs,
                telephonicLogs,
                telephonicStateLogs,
                userLogs
            }
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAll() logs: ${error}`, errorLogs)
            return null
        }
    }
    // private async IsAlreadySaved(log: typeLogObj, collection: string): Promise<boolean> {
    //     try {
    //         const logObj: typeLogObj = await getCollection().findOne({ logText: log.logText }) as typeLogObj
    //         if (logObj) {
    //             console.log("Se evitó un duplicado simple: " + log.logText)
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
    //                     console.log("Se evitó un duplicado por regex: " + log.logText)
    //                     return true
    //                 }
    //             })
    //         }

    //         return false
    //     } catch (error) {
    //         console.log(`Falló IsAlreadySaved() ${log.logText}: ${error}`)
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
