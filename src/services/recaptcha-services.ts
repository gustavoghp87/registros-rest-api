import Axios from 'axios'
import { logger } from '../server'
import { privateKey } from '../env-variables'
import { errorLogs } from './log-services'

export const checkRecaptchaTokenService = async (recaptchaToken: string): Promise<boolean> => {
    if (!recaptchaToken || !privateKey) return false
    const verifyURL: string = `https://www.google.com/recaptcha/api/siteverify?secret=${privateKey}&response=${recaptchaToken}`
    try {
        const { data } = await Axios.post(verifyURL)
        return !!data?.success
    } catch (error) {
        logger.Add(`Falló checkRecaptchaTokenService(): ${error}`, errorLogs)
        return false
    }
}
