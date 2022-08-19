import { ObjectId } from 'mongodb'

export type typeUser = {
    __v?: number
    _id?: ObjectId       // to remove
    email: string
    group: number
    id: number
    isActive: boolean
    password?: string
    phoneAssignments: number[]
    recoveryOptions: typeRecoveryOption[]
    role: number
    tokenId: number
}

export type typeRecoveryOption = {
    expiration: number
    id: string
    used: boolean
}

export type typeJWTObjectForUser = {
    exp: number
    iat: number
    tokenId: number
    userId: string
}
