import { typeCampaignPack } from '../models/campaign'
import { typeUser } from '../models/user'
import { logger } from '../server'
import { CampaignDb } from '../services-db/campaignDbConnection'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'

// const campaignDb: CampaignDb = new CampaignDb()

export const getCampaignPacksService = async (token: string): Promise<typeCampaignPack[]|null> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await new CampaignDb().GetCampaignPacks()
    return packs
}

export const getCampaignPacksByUserService = async (token: string): Promise<typeCampaignPack[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const packs: typeCampaignPack[]|null = await new CampaignDb().GetCampaignPacksByUser(user.email)
    return packs
}

export const getCampaignPackService = async (token: string, idString: string): Promise<typeCampaignPack|null> => {
    let id: number = 0
    try { id = parseInt(idString) } catch (error) { return null }
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !id || isNaN(id)) return null
    const pack: typeCampaignPack|null = await new CampaignDb().GetCampaignPackById(id)
    if (pack?.asignado !== user.email) return null    //checks this user is auth to get this pack
    return pack
}

export const editCampaignPackService = async (token: string, id: number, phoneNumber: number, checked: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !id || !phoneNumber || checked === undefined || typeof checked !== 'boolean') return false
    const pack: typeCampaignPack|null = await new CampaignDb().GetCampaignPackById(id)
    if (!pack || (pack.asignado !== user.email && user.role !== 1)) return false    //checks this user is auth to edit this pack
    const success: boolean = await new CampaignDb().EditCampaignPackById(id, phoneNumber, checked)
    if (success) checkIfTerritoryIsFinishedService(pack.id, user)
    return success
}

const checkIfTerritoryIsFinishedService = async (id: number, user: typeUser): Promise<void> => {
    const pack: typeCampaignPack|null = await new CampaignDb().GetCampaignPackById(id)
    if (pack && pack.llamados && pack.llamados.length === 50) {
        const success: boolean = await new CampaignDb().CloseCampaignPack(id)
        if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} terminó el paquete ${id}`, "campaignFinishing")
    }
}

export const closeCampaignPackService = async (token: string, id: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !id) return false
    const pack: typeCampaignPack|null = await new CampaignDb().GetCampaignPackById(id)
    if (!pack || (pack.asignado !== user.email && user.role !== 1)) return false    //checks this user is auth to edit this pack
    const success: boolean = await new CampaignDb().CloseCampaignPack(id)
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user?.email} marcó como terminado el paquete ${id}`, "campaignFinishing")
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
    const success: boolean = await new CampaignDb().AssignCampaignPackByEmail(id, email)
    if (success) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} asignó el paquete ${id} a ${email}`, "campaignAssignment")
    return success
}

export const askForANewCampaignPackService = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    const id: number|null = await new CampaignDb().AskForANewCampaignPack(user.email)
    if (id) logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} recibió el paquete ${id} por solicitud automática`, "campaignAssignment")
    return id ? true : false
}
