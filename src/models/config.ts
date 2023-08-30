export type typeInvitarionNewUser = {
    email: string
    expire: number
    id: string
    inviting: number
}

export type typeConfig = {
    congregation: number
    date: number
    googleBoardUrl: string
    invitations: typeInvitarionNewUser[]
    name: string
    numberOfTerritories: number
}
