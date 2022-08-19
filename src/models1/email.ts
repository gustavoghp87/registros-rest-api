import { ObjectId } from 'mongodb'

export type typeEmailObj = {
    _id?: ObjectId
    lastEmailDate: number
    accessToken: string
    refreshToken: string
}
