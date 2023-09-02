import { isProduction } from '../server'
import { LogDb } from '../services-db/logDbConnection'
import { typeLogsPackage, typeLogObj, typeAllLogsObj, typeLogType, typeUser } from '../models'

export const campaignLogs: typeLogType = 'CampaignLogs'
export const configLogs: typeLogType = 'ConfigLogs'
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

    public async Add(congregation: number, logText: string, type: typeLogType): Promise<boolean> {
        const newDateTs: number = isProduction ? new Date().getTime() - 3*60*60*1000 : new Date().getTime()
        const newDate = new Date().setTime(newDateTs)
        logText = new Date(newDate).toLocaleString('es-AR') + " | " + logText
        console.log(logText)
        // if (!isProduction) return true
        const log: typeLogObj = {
            timestamp: Date.now(),
            logText
        }
        const success: boolean = await this.LogDbConnection.Add(congregation, log, type)
        return success
    }

    public async Genesys(congregation: number) {
        const success: boolean = await this.LogDbConnection.Genesys(congregation)
        if (success) {
            this.Add(congregation, "Se crearon los objetos de logs en la base de datos", configLogs)
        } else {
            this.Add(congregation, "Falló Logs Genesys...", errorLogs)
        }
        return success
    }

    public async Get(congregation: number, requesterUser: typeUser, type: typeLogType): Promise<typeLogsPackage|null> {
        if (!congregation || !requesterUser || requesterUser.role !== 1) return null
        const logs: typeLogsPackage|null = await this.LogDbConnection.Get(congregation, type)
        return logs
    }

    public async GetAll(requesterUser: typeUser): Promise<typeAllLogsObj|null> {
        if (!requesterUser || requesterUser.role !== 1) return null
        const logs: typeAllLogsObj|null = await this.LogDbConnection.GetAll(requesterUser.congregation)
        return logs
    }
}
