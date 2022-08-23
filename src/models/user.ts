export type typeUser = {
    email: string
    group: number
    hthAssignments: number[]
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
    userId: number
}
