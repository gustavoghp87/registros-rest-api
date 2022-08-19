import { ObjectId } from 'mongodb'

export type typeCampaignPack = {
    id: number
    desde: number
    al: number
    asignado?: string
    terminado?: boolean
    llamados?: number[]
    accessible?: boolean
}
