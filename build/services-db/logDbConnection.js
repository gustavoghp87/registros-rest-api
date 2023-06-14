"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollLogs);
class LogDb {
    constructor() {
        this.CampaignLogs = 'CampaignLogs';
        this.ErrorLogs = 'ErrorLogs';
        this.HouseToHouseAdminLogs = 'HouseToHouseAdminLogs';
        this.HouseToHouseLogs = 'HouseToHouseLogs';
        this.LoginLogs = 'LoginLogs';
        this.TelephonicLogs = 'TelephonicLogs';
        this.TelephonicStateLogs = 'TelephonicStateLogs';
        this.UserLogs = 'UserLogs';
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
    async Add(log, type) {
        try {
            //const isAlreadySaved: boolean = collection !== 'TerritoryChangeLogs' && await this.IsAlreadySaved(log, collection)
            // if (isAlreadySaved) {
            //     ("Se evitó un repetido")
            //     return true
            // }
            await getCollection().updateOne({ type }, { $push: { logs: log } });
            return true;
        }
        catch (error) {
            console.log("\n\nFailed adding logs to db:", error, "\n\n");
            return false;
        }
    }
    async Get(type) {
        try {
            const logs = await getCollection().findOne({ type });
            return logs;
        }
        catch (error) {
            server_1.logger.Add(`Falló Get() logs ${type}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetAll() {
        try {
            const campaignLogs = await getCollection().findOne({ type: this.CampaignLogs });
            const errorLogs = await getCollection().findOne({ type: this.ErrorLogs });
            const houseToHouseAdminLogs = await getCollection().findOne({ type: this.HouseToHouseAdminLogs });
            const houseToHouseLogs = await getCollection().findOne({ type: this.HouseToHouseLogs });
            const loginLogs = await getCollection().findOne({ type: this.LoginLogs });
            const telephonicLogs = await getCollection().findOne({ type: this.TelephonicLogs });
            const telephonicStateLogs = await getCollection().findOne({ type: this.TelephonicStateLogs });
            const userLogs = await getCollection().findOne({ type: this.UserLogs });
            return {
                campaignLogs,
                errorLogs,
                houseToHouseAdminLogs,
                houseToHouseLogs,
                loginLogs,
                telephonicLogs,
                telephonicStateLogs,
                userLogs
            };
        }
        catch (error) {
            server_1.logger.Add(`Falló GetAll() logs: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
}
exports.LogDb = LogDb;
// First, create the index:
//     db.users.createIndex( { "username": "text" } )
// Then, to search:
//     db.users.find( { $text: { $search: "son" } } )
// Benchmarks (~150K documents):
// Regex (other answers) => 5.6-6.9 seconds
// Text Search => .164-.201 seconds
