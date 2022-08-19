import { ObjectId } from 'mongodb'

export type typeEmailObj = {
    _id?: ObjectId
    lastEmail: string
    accessToken: string
    refreshToken: string
}
