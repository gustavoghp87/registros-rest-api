import * as userServices from './user-services'
import { typePack } from '../models/pack'
import { CampaignDb } from './database-services/campaignDbConnection'

export const getCampaign = async (token: string) => {
    if (!userServices.checkAuthByToken(token)) return null
    const pack = await new CampaignDb().GetCampaign()
    if (!pack) return null
    console.log("Pasó auth ############ mandando campanya 2021")
    return pack
}

export const asignCampaign = async (token: string, id: number, email: string) => {
    if (!userServices.checkAdminByToken(token)) return false
    console.log("Pasó auth ############ asignando usuario a campanya 2021")
    const response = await new CampaignDb().AsignCampaign(id, email)
    if (!response) return false
    return true
}

export const getPack = async (id: number) => {                // falta el auth
    const pack:typePack|null = await new CampaignDb().GetPack(id)
    if (!pack) return null
    return pack
}

export const clickBox = async (token: string, tel: number, id: number, checked: boolean) => {
    if (!userServices.checkAuthByToken(token)) return false
    const user = await userServices.searchUserByToken(token)
    if (!user) return false
    const response = await new CampaignDb().ClickBox(user.email, tel, id, checked)
    if (!response) return false
    return true
}

export const markEverythingLikeCalled = async (token: string, packId: number) => {
    if (!userServices.checkAdminByToken(token)) return null
    const response = await new CampaignDb().MarkEverythingLikeCalled(packId)
    if (!response) return false
    return true
}
