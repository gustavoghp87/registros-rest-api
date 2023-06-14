"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.userLogs = exports.telephonicStateLogs = exports.telephonicLogs = exports.loginLogs = exports.houseToHouseLogs = exports.houseToHouseAdminLogs = exports.errorLogs = exports.campaignLogs = void 0;
const server_1 = require("../server");
const logDbConnection_1 = require("../services-db/logDbConnection");
exports.campaignLogs = 'CampaignLogs';
exports.errorLogs = 'ErrorLogs';
exports.houseToHouseAdminLogs = 'HouseToHouseAdminLogs';
exports.houseToHouseLogs = 'HouseToHouseLogs';
exports.loginLogs = 'LoginLogs';
exports.telephonicLogs = 'TelephonicLogs';
exports.telephonicStateLogs = 'TelephonicStateLogs';
exports.userLogs = 'UserLogs';
class Logger {
    constructor() {
        this.LogDbConnection = new logDbConnection_1.LogDb();
    }
    async Add(logText, type) {
        const newDateTs = server_1.isProduction ? new Date().getTime() - 3 * 60 * 60 * 1000 : new Date().getTime();
        const newDate = new Date().setTime(newDateTs);
        logText = new Date(newDate).toLocaleString('es-AR') + " | " + logText;
        console.log(logText);
        if (!server_1.isProduction)
            return true;
        const log = {
            timestamp: +new Date(),
            logText
        };
        const success = await this.LogDbConnection.Add(log, type);
        return success;
    }
    async Get(requesterUser, type) {
        if (!requesterUser || requesterUser.role !== 1)
            return null;
        const logs = await this.LogDbConnection.Get(type);
        return logs;
    }
    async GetAll(requesterUser) {
        if (!requesterUser || requesterUser.role !== 1)
            return null;
        const logs = await this.LogDbConnection.GetAll();
        return logs;
    }
}
exports.Logger = Logger;
