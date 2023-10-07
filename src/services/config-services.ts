import { ConfigDb } from '../services-db/configDbConnection'
import { configLogs, errorLogs } from './log-services'
import { getRandomId24 } from './helpers'
import { getUserByEmailEveryCongregationService } from './user-services'
import { logger } from '../server'
import { sendUserInvitationByEmailService } from './email-services'
import { typeConfig, typeUser } from '../models'

const configDbConnection = new ConfigDb()

// FLUJO NUEVA CONGREGACIÓN
// por request de la congregación 1, crear invitación sin especificar el número de la congregación nueva pero con bandera especial
// guardar la invitación en invitaciones de la congregación 1
// mandar la invitación por email

// en otro endpoint:
// recibo contraseña del nuevo usuario,
//  veo que su invitación es para nueva congregación
//  creo nuevo usuario admin checkeando qué número de congregación le corresponde,

// cuando ingresa, el usuario va a Administradores/Configuración de la Aplicación y setea el nombre de la Congregación
// al hacerlo, se habilita la creación de territorios casa-en-casa
//  y se crean el objeto de configuración de la Congregación y los objetos de Logs

// cuando crea los territorios casa-en-casa, se setea el parámetro de cantidad de territorios y eso habilita el ingreso a los territorios

export const createCongregationService = async (congregation: number, userEmail: string): Promise<boolean> => {
    await logger.Genesys(congregation)
    const success: boolean = await configDbConnection.Genesys(congregation)
    if (success) {
        logger.Add(congregation, `Admin ${userEmail} creó el objeto de congregación número ${congregation}`, configLogs)
    } else {
        logger.Add(congregation, `Falló la creación de objeto de congregación número ${congregation} (${userEmail})`, errorLogs)
    }
    return success
}

export const getConfigNotAuthedService = async (congregation: number): Promise<typeConfig|null> => {
    const config: typeConfig|null = await configDbConnection.GetConfig(congregation)
    return config
}

export const getConfigService = async (requesterUser: typeUser): Promise<typeConfig|null> => {
    if (!requesterUser) return null
    const config: typeConfig|null = await getConfigNotAuthedService(requesterUser.congregation)
    return config
}

export const getMaxCongregationNumberService = async (): Promise<number|null> => {
    const maxCongregationNumber = await configDbConnection.GetMaxCongregationNumber()
    if (!maxCongregationNumber) logger.Add(1, `Falló la obtención del mayor número de Congregación`, errorLogs)
    return maxCongregationNumber
}

export const sendInvitationForNewUserService = async (requesterUser: typeUser, email: string, isNewCongregation: boolean = false): Promise<boolean|string> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const user = await getUserByEmailEveryCongregationService(email)
    if (user) return 'exists'
    const id = getRandomId24()
    const successEmail = await sendUserInvitationByEmailService(requesterUser.congregation, email, id, isNewCongregation)
    if (!successEmail) {
        return 'not sent'
    }
    const success: boolean = await configDbConnection.SaveNewUserInvitation(requesterUser.id, requesterUser.congregation, email, id, isNewCongregation)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} invitó a ${email}${isNewCongregation ? ' para crear una nueva Congregación' : ''}`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la invitación de Admin (${requesterUser.email}) a ${email}${isNewCongregation ? ' para crear una nueva Congregación' : ''}`, errorLogs)
    }
    return success
}

export const setDisableCloseHthFacesService = async (requesterUser: typeUser, disableCloseHthFaces: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const success: boolean = await configDbConnection.SetDisableCloseHthFaces(requesterUser.congregation, disableCloseHthFaces)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${disableCloseHthFaces ? 'deshabilitó' : 'habilitó'} la función de cerrar caras de casa en casa`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la solicitud de Admin (${requesterUser.email}) para ${disableCloseHthFaces ? 'deshabilitar' : 'habilitar'} la función de cerrar caras de casa en casa`, errorLogs)
    }
    return success
}

export const setDisableEditHthMapsService = async (requesterUser: typeUser, disableEditHthMaps: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const success: boolean = await configDbConnection.SetDisableEditHthMaps(requesterUser.congregation, disableEditHthMaps)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${disableEditHthMaps ? 'deshabilitó' : 'habilitó'} la edición de Mapas de casa en casa`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la solicitud de Admin (${requesterUser.email}) para ${disableEditHthMaps ? 'deshabilitar' : 'habilitar'} la edición de Mapas de casa en casa`, errorLogs)
    }
    return success
}

export const setDisableHthBuildingsForUnassignedUsersService = async (requesterUser: typeUser, disableHthBuildingsForUnassignedUsers: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const success: boolean = await configDbConnection.SetDisableHthBuildingsForUnassignedUsers(requesterUser.congregation, disableHthBuildingsForUnassignedUsers)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${disableHthBuildingsForUnassignedUsers ? 'deshabilitó' : 'habilitó'} la predicación de Edificios de casa en casa para usuarios no asignados`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la solicitud de Admin (${requesterUser.email}) para ${disableHthBuildingsForUnassignedUsers ? 'deshabilitar' : 'habilitar'} la predicación de Edificios de casa en casa para usuarios no asignados`, errorLogs)
    }
    return success
}

export const setDisableHthFaceObservatiosService = async (requesterUser: typeUser, disableHthFaceObservations: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const success: boolean = await configDbConnection.SetDisableHthFaceObservatios(requesterUser.congregation, disableHthFaceObservations)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${disableHthFaceObservations ? 'deshabilitó' : 'habilitó'} la función de Observaciones de Caras`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la solicitud de Admin (${requesterUser.email}) para ${disableHthFaceObservations ? 'deshabilitar' : 'habilitar'} la función de Observaciones de Caras`, errorLogs)
    }
    return success
}

export const setNameOfCongregationService = async (requesterUser: typeUser, name: string): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!name || name.length < 6) return false
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

export const setUseLettersForBlocksService = async (requesterUser: typeUser, useLettersForBlocks: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    const success: boolean = await configDbConnection.SetUseLettersForBlocksService(requesterUser.congregation, useLettersForBlocks)
    if (success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${useLettersForBlocks ? 'habilitó' : 'deshabilitó'} el uso de Letras para identificar las Manzanas`, configLogs)
    } else {
        logger.Add(requesterUser.congregation, `Falló la solicitud de Admin (${requesterUser.email}) para ${useLettersForBlocks ? 'deshabilitar' : 'habilitar'} el uso de Letras para identificar las Manzanas`, errorLogs)
    }
    return success
}
