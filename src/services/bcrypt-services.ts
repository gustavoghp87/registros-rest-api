import bcrypt from 'bcrypt'
import { logger } from '../server'
import { bcryptSalt } from '../env-variables'
import { errorLogs } from './log-services'

export const generatePasswordHash = async (password: string): Promise<string|null> => {
    try {
        const passwordHash: string = await bcrypt.hash(password, parseInt(bcryptSalt))
        return passwordHash
    } catch (error) {
        console.log(error)
        logger.Add(`Falló generatePasswordHash(): ${error}`, errorLogs)
        return null
    }
}

export const comparePasswordsService = async (password0: string, password1: string): Promise<boolean> => {
    try {
        const success: boolean = await bcrypt.compare(password0, password1)
        return success
    } catch (error) {
        console.log(error)
        logger.Add(`Falló comparePasswordsService(): ${error}`, errorLogs)
        return false
    }
}
