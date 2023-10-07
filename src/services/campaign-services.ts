import { CampaignDb } from '../services-db/campaignDbConnection'
import { campaignLogs, errorLogs } from './log-services'
import { logger } from '../server'
import { typeCampaignPack, typeUser } from '../models'

const campaignDbConnection: CampaignDb = new CampaignDb()

export const getCampaignPacksService = async (requesterUser: typeUser): Promise<typeCampaignPack[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacks(requesterUser.congregation)
    return packs
}

export const getCampaignPacksByUserService = async (requesterUser: typeUser): Promise<number[]|null> => {
    if (!requesterUser) return null
    const packs: typeCampaignPack[]|null = await campaignDbConnection.GetCampaignPacksByUser(requesterUser.congregation, requesterUser.email)
    if (!packs) return null
    let campaignAssignments: number[] = []
    packs.forEach(x => campaignAssignments.push(x.id))
    return campaignAssignments
}

export const getCampaignPackService = async (requesterUser: typeUser, idString: string): Promise<typeCampaignPack|null> => {
    // accessible
    let id: number = parseInt(idString)
    if (!id || isNaN(id)) return null
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(requesterUser.congregation, id)
    if (!pack) return null
    if (pack.isAccessible) return pack
    if (!requesterUser) return null
    if (pack.assignedTo !== requesterUser.email) return null
    return pack
}

export const editCampaignPackService = async (requesterUser: typeUser, id: number, phoneNumber: number, checked: boolean): Promise<typeCampaignPack|null> => {
    // accessible
    if (!id || !phoneNumber) return null
    let pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(requesterUser.congregation, id)
    if (!pack) return null
    if (!pack.isAccessible && (!requesterUser || (pack.assignedTo !== requesterUser.email && requesterUser.role !== 1))) return null
    if (!requesterUser) requesterUser = anonymousUser
    checked = !!checked
    const success: boolean = await campaignDbConnection.EditCampaignPackById(requesterUser.congregation, id, phoneNumber, checked)
    if (!success) {
        logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser?.email} no pudo cambiar teléfono de paquete ${id} ${phoneNumber} a ${checked}`, errorLogs)
        return null
    }
    // checkIfTerritoryIsFinishedService
    pack = await campaignDbConnection.GetCampaignPackById(requesterUser.congregation, id)
    if (pack && pack.calledPhones.length === 50) {
        const success1: boolean = await campaignDbConnection.CloseCampaignPack(requesterUser.congregation, id)
        if (success1) logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser?.email} terminó el paquete ${id}`, campaignLogs)
        else logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser?.email} no pudo cerrar el paquete ${id} después de terminarlo`, errorLogs)
    }
    pack = await campaignDbConnection.GetCampaignPackById(requesterUser.congregation, id)
    return pack
}

const anonymousUser: typeUser = {
    congregation: 0,
    email: "anónimo por accesibilidad",
    // group: 0,
    hthAssignments: [],
    id: 0,
    isActive: false,
    phoneAssignments: [],
    recoveryOptions: [],
    role: 0,
    tokenId: 0
}

export const closeCampaignPackService = async (requesterUser: typeUser, id: number): Promise<boolean> => {
    // accessible   BROKEN FOR MULTICONGREGATIONAL VERSION
    if (!id) return false
    const pack: typeCampaignPack|null = await campaignDbConnection.GetCampaignPackById(requesterUser.congregation, id)
    if (!pack) return false
    if (!pack.isAccessible && (!requesterUser || (pack.assignedTo !== requesterUser.email && requesterUser.role !== 1))) return false
    const success: boolean = await campaignDbConnection.CloseCampaignPack(requesterUser.congregation, id)
    if (!requesterUser) requesterUser = anonymousUser
    if (success) logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser?.email} marcó como terminado el paquete ${id}`, campaignLogs)
    return success
}

export const assignCampaignPackService = async (requesterUser: typeUser, idString: string, email: string): Promise<boolean> => {
    let id: number = parseInt(idString)
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!id || isNaN(id) || !email) return false
    const success: boolean = await campaignDbConnection.AssignCampaignPackByEmail(requesterUser.congregation, id, email)
    if (success) logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} asignó el paquete ${id} a ${email}`, campaignLogs)
    else logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo asignar el paquete ${id} a ${email}`, errorLogs)
    return success
}

export const askForANewCampaignPackService = async (requesterUser: typeUser): Promise<boolean> => {
    if (!requesterUser) return false
    const id: number|null = await campaignDbConnection.AskForANewCampaignPack(requesterUser.congregation, requesterUser.email)
    if (id) logger.Add(requesterUser.congregation, `${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} recibió el paquete ${id} por solicitud automática`, campaignLogs)
    return !!id
}

export const enableAccesibilityModeService = async (requesterUser: typeUser, id: number, accessible: boolean): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!id) return false
    accessible = !!accessible
    const success: boolean = await campaignDbConnection.ChangeAccesibilityMode(requesterUser.congregation, id, accessible)
    if (!success) {
        logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} no pudo habilitar el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignLogs)
        return false
    }
    logger.Add(requesterUser.congregation, `Admin ${requesterUser.email} ${accessible ? "habilitó" : "deshabilitó"} el modo de accesibilidad para el paquete ${id} ${accessible}`, campaignLogs)
    return true
}
