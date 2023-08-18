import { errorLogs } from './log-services'
import { logger } from '../server'
import { privateKey } from '../env-variables'
import Axios from 'axios'

export const checkRecaptchaTokenService = async (congregation: number, recaptchaToken: string): Promise<boolean> => {
    if (!recaptchaToken || !privateKey) return false
    const verifyURL: string = `https://www.google.com/recaptcha/api/siteverify?secret=${privateKey}&response=${recaptchaToken}`
    try {
        const { data } = await Axios.post(verifyURL)
        return !!data?.success
    } catch (error) {
        logger.Add(congregation, `Falló checkRecaptchaTokenService(): ${error}`, errorLogs)
        return false
    }
}
