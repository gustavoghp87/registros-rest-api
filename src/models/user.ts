export type typeUser = {
    _id?: Object
    role: number
    estado: boolean
    email: string
    password?: string
    __v?: number
    group: number
    isAuth?: boolean
    isAdmin?: boolean
    asign?: number[]
    darkMode?: boolean
    tokenId?: number
}

export type decodedObject = {
    userId: string
    tokenId?: number
    iat: number
    exp: number
}
