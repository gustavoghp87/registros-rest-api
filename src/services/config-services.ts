import { ConfigDb } from '../services-db/configDbConnection'
import { configLogs, errorLogs } from './log-services'
import { getUserByEmailEveryCongregationService, getUserByEmailService } from './user-services'
import { logger } from '../server'
import { typeConfig, typeUser } from '../models'

const configDbConnection = new ConfigDb()

export const inviteNewUserService = async (requesterUser: typeUser, email: string): Promise<boolean|string> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const user = await getUserByEmailEveryCongregationService(email)
    if (user) return 'exists'
    
    // send email
    
    const success: boolean = await configDbConnection.InviteNewUser(requesterUser.id, requesterUser.congregation, email)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} invitó a ${email}`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la invitación a ${email} (${requesterUser.email})`, errorLogs)
    }
    return success
}

export const getConfigService = async (requesterUser: typeUser): Promise<typeConfig|null> => {
    if (!requesterUser) return null
    const config: typeConfig|null = await configDbConnection.GetConfig(requesterUser.congregation)
    return config
}

const createCongregationService = async (congregation: number, userEmail: string): Promise<boolean> => {
    const success: boolean = await configDbConnection.Genesys(congregation)
    if (success) {
        logger.Add(congregation, `Admin ${userEmail} creó el objeto de congregación número ${congregation}`, configLogs)
    } else {
        logger.Add(congregation, `Falló la creación de objeto de congregación número ${congregation} (${userEmail})`, errorLogs)
    }
    return success
}

export const setNameOfCongregationService = async (requesterUser: typeUser, name: string): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!name || name.length < 6) return false
    const config = await getConfigService(requesterUser)
    if (!config) {
        const successGenesys: boolean = await createCongregationService(requesterUser.congregation, requesterUser.email)
        if (!successGenesys) return false
    }
    const success: boolean = await configDbConnection.SetNameOfCongregation(requesterUser.congregation, name)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} estableció el nombre de la congregación ${requesterUser.congregation}: ${name}`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la edición del nombre de la congregación número ${requesterUser.congregation}: ${name} (${requesterUser.email})`, errorLogs)
    }
    return success
}

export const setGoogleBoardUrlService = async (requesterUser: typeUser, googleBoardUrlCliente: string): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!googleBoardUrlCliente?.includes('sites.google.com')) return false
    const googleBoardUrl = googleBoardUrlCliente.split('sites.google.com')[1]
    if (!googleBoardUrl || googleBoardUrl.length < 5) return false
    const success: boolean = await configDbConnection.SetGoogleBoardUrl(requesterUser.congregation, googleBoardUrl)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} estableció la dirección del tablero Google de la congregación ${requesterUser.congregation}: ${googleBoardUrl}`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la edición de la URL del tablero Google congregación número ${requesterUser.congregation}: ${googleBoardUrl} (${requesterUser.email})`, errorLogs)
    }
    return success
}

export const setNumberOfTerritoriesService = async (congregation: number, userEmail: string, numberOfTerritories: number) => {
    const success: boolean = await configDbConnection.SetNumberOfTerritories(congregation, numberOfTerritories)
    if (success) {
        logger.Add(congregation, `Admin ${userEmail} estableció el número de territorios de la congregación ${congregation}: ${numberOfTerritories}`, configLogs)
    } else {
        logger.Add(congregation, `Falló la edición del número de territorios de la congregación ${congregation} (${numberOfTerritories}) (${userEmail})`, errorLogs)
    }
    return success
}
