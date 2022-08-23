import { logger } from '../server'
import { CampaignDb } from '../services-db/campaignDbConnection'
import { campaignLogs, errorLogs } from './log-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { typeCampaignPack, typeUser } from '../models'

const campaignDbConnection: CampaignDb = new CampaignDb()

export const getCampaignPacksService = async (token: string): Promise<typeCampaignPack[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacks()
    return packs
}

export const getCampaignPacksByUserService = async (token: string): Promise<number[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacksByUser(user.email)
    if (!packs) return null
    let campaignAssignments: number[] = []
    packs.forEach(x => campaignAssignments.push(x.id))
    return campaignAssignments
}

export const getCampaignPackService = async (token: string, idString: string): Promise<typeCampaignPack|null> => {
    // accessible
    let id: number = parseInt(idString)
    if (!id || isNaN(id)) return null
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return null
    if (pack.isAccessible) return pack
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || pack.assignedTo !== user.email) return null
    return pack
}

export const editCampaignPackService = async (token: string, id: number, phoneNumber: number, checked: boolean): Promise<typeCampaignPack|null> => {
    // accessible
    if (!id || !phoneNumber) return null
    let pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return null
    let user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!pack.isAccessible && (!user || (pack.assignedTo !== user.email && user.role !== 1))) return null
    if (!user) user = anonymousUser
    checked = !!checked
    const success: boolean = await campaignDbConnection.EditCampaignPackById(id, phoneNumber, checked)
    if (!success) {
        logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} no pudo cambiar teléfono de paquete ${id} ${phoneNumber} a ${checked}`, errorLogs)
        return null
    }
    // checkIfTerritoryIsFinishedService
    pack = await campaignDbConnection.GetCampaignPackById(id)
    if (pack && pack.calledPhones.length === 50) {
        const success1: boolean = await campaignDbConnection.CloseCampaignPack(id)
        if (success1) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} terminó el paquete ${id}`, campaignLogs)
        else logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} no pudo cerrar el paquete ${id} después de terminarlo`, errorLogs)
    }
    pack = await campaignDbConnection.GetCampaignPackById(id)
    return pack
}

const anonymousUser: typeUser = {
    email: "anónimo por accesibilidad",
    group: 0,
    hthAssignments: [],
    id: 0,
    isActive: false,
    phoneAssignments: [],
    recoveryOptions: [],
    role: 0,
    tokenId: 0
}

export const closeCampaignPackService = async (token: string, id: number): Promise<boolean> => {
    // accessible
    if (!id) return false
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return false
    let user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!pack.isAccessible && (!user || (pack.assignedTo !== user.email && user.role !== 1))) return false    //checks this user is auth to edit this pack
    const success: boolean = await campaignDbConnection.CloseCampaignPack(id)
    if (!user) user = anonymousUser
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} marcó como terminado el paquete ${id}`, campaignLogs)
    return success
}

export const assignCampaignPackService = async (token: string, idString: string, email: string): Promise<boolean> => {
    let id: number = 0
    try {
        id = parseInt(idString)
    } catch (error) {
        return false
    }
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !token || !id || !email) return false
    const success: boolean = await campaignDbConnection.AssignCampaignPackByEmail(id, email)
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} asignó el paquete ${id} a ${email}`, campaignLogs)
    else logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} no pudo asignar el paquete ${id} a ${email}`, errorLogs)
    return success
}

export const askForANewCampaignPackService = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    const id: number|null = await campaignDbConnection.AskForANewCampaignPack(user.email)
    if (id) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} recibió el paquete ${id} por solicitud automática`, campaignLogs)
    return !!id
}

export const enableAccesibilityModeService = async (token: string, id: number, accessible: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !id) return false
    accessible = !!accessible
    const success: boolean = await campaignDbConnection.ChangeAccesibilityMode(id, accessible)
    if (!success) {
        logger.Add(`Admin ${user.email} no pudo habilitar el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignLogs)
        return false
    }
    logger.Add(`Admin ${user.email} ${accessible ? "habilitó" : "deshabilitó"} el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignLogs)
    return true
}
