import { logger } from '../server'
import { CampaignDb } from '../services-db/campaignDbConnection'
import { campaignAssignment, campaignFinishing } from './log-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { typeCampaignPack, typeUser } from '../models'

const campaignDbConnection: CampaignDb = new CampaignDb()

export const getCampaignPacksService = async (token: string): Promise<typeCampaignPack[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacks()
    return packs
}

export const getCampaignPacksByUserService = async (token: string): Promise<typeCampaignPack[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacksByUser(user.email)
    return packs
}

export const getCampaignPackService = async (token: string, idString: string): Promise<typeCampaignPack|null> => {
    // accessible
    let id: number = 0
    try { id = parseInt(idString) } catch (error) { return null }
    if (!id || isNaN(id)) return null
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return null
    if (pack.accessible) return pack
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || pack.asignado !== user.email) return null    //checks this user is auth to get this pack
    return pack
}

export const editCampaignPackService = async (token: string, id: number, phoneNumber: number, checked: boolean): Promise<boolean> => {
    // accessible
    if (!id || !phoneNumber) return false
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return false
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!pack.accessible && (!user || (pack.asignado !== user.email && user.role !== 1))) return false    //checks this user is auth to edit this pack
    checked = !checked ? false : true
    const success: boolean = await campaignDbConnection.EditCampaignPackById(id, phoneNumber, checked)
    if (success) checkIfTerritoryIsFinishedService(pack.id, user)
    return success
}

const checkIfTerritoryIsFinishedService = async (id: number, user: typeUser|null): Promise<void> => {
    if (!user) user = { role: 0, email: "anónimo por accesibilidad", estado: false, group: 0 }
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (pack && pack.llamados && pack.llamados.length === 50) {
        const success: boolean = await campaignDbConnection.CloseCampaignPack(id)
        if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} terminó el paquete ${id}`, campaignFinishing)
    }
}

export const closeCampaignPackService = async (token: string, id: number): Promise<boolean> => {
    // accessible
    if (!id) return false
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(id)
    if (!pack) return false
    let user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!pack.accessible && (!user || (pack.asignado !== user.email && user.role !== 1))) return false    //checks this user is auth to edit this pack
    const success: boolean = await campaignDbConnection.CloseCampaignPack(id)
    if (!user) user = { role: 0, email: "anónimo por accesibilidad", estado: false, group: 0 }
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} marcó como terminado el paquete ${id}`, campaignFinishing)
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
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} asignó el paquete ${id} a ${email}`, campaignAssignment)
    return success
}

export const askForANewCampaignPackService = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    const id: number|null = await campaignDbConnection.AskForANewCampaignPack(user.email)
    if (id) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} recibió el paquete ${id} por solicitud automática`, campaignAssignment)
    return !!id
}

export const enableAccesibilityModeService = async (token: string, id: number, accessible: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !id) return false
    accessible = !accessible ? false : true
    const success: boolean = await campaignDbConnection.ChangeAccesibilityMode(id, accessible)
    if (success)
        logger.Add(`Admin ${user.email} ${accessible ? "habilitó" : "deshabilitó"} el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignAssignment)
    else
        logger.Add(`Admin ${user.email} no pudo habilitar el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignAssignment)
    return !!id
}
