import { ObjectId } from 'mongodb'

export type typeCampaignPack = {
    _id?: ObjectId
    assignedTo: string
    calledPhones: number[]
    from: number
    id: number
    isAccessible: boolean
    isFinished: boolean
    to: number
}
