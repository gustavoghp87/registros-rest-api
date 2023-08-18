import { bcryptSalt } from '../env-variables'
import { errorLogs } from './log-services'
import { logger } from '../server'
import bcrypt from 'bcrypt'

export const generatePasswordHash = async (congregation: number, password: string): Promise<string|null> => {
    try {
        const passwordHash: string = await bcrypt.hash(password, parseInt(bcryptSalt))
        return passwordHash
    } catch (error) {
        logger.Add(congregation, `Falló generatePasswordHash(): ${error}`, errorLogs)
        return null
    }
}

export const comparePasswordsService = async (congregation: number, password: string, passwordHash: string): Promise<boolean> => {
    try {
        const success: boolean = await bcrypt.compare(password, passwordHash)
        return success
    } catch (error) {
        logger.Add(congregation, `Falló comparePasswordsService(): ${error}`, errorLogs)
        return false
    }
}
