import { isProduction } from '../server1'
import { getActivatedAdminByAccessTokenService } from './user-services'
import { LogDb } from '../services-db1/logDbConnection'
import { typeLogsPackage, typeLogObj, typeAllLogsObj, typeLogType, typeUser } from '../models1'

export const campaignLogs: typeLogType = 'CampaignLogs'
export const errorLogs: typeLogType = 'ErrorLogs'
export const houseToHouseAdminLogs: typeLogType = 'HouseToHouseAdminLogs'
export const houseToHouseLogs: typeLogType = 'HouseToHouseLogs'
export const loginLogs: typeLogType = 'LoginLogs'
export const telephonicLogs: typeLogType = 'TelephonicLogs'
export const telephonicStateLogs: typeLogType = 'TelephonicStateLogs'
export const userLogs: typeLogType = 'UserLogs'

export class Logger {

    private LogDbConnection: LogDb

    constructor() {
        this.LogDbConnection = new LogDb()
    }

    public async Add(logText: string, type: typeLogType): Promise<boolean> {
        const newDateTs: number = isProduction ? new Date().getTime() - 3*60*60*1000 : new Date().getTime()
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
        const success: boolean = await this.LogDbConnection.Add(log, type)
        return success
    }

    public async Get(token: string, type: typeLogType): Promise<typeLogsPackage|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user) return null
        const logs: typeLogsPackage|null = await this.LogDbConnection.Get(type)
        return logs
    }

    public async GetAll(token: string): Promise<typeAllLogsObj|null> {
        const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
        if (!user) return null
        const logs: typeAllLogsObj|null = await this.LogDbConnection.GetAll()
        return logs
    }
}
