export type typeInvitarionNewUser = {
    email: string
    expire: number
    id: string
    inviting: number
    isNewCongregation: boolean
}

export type typeConfig = {
    congregation: number
    date: number
    disabledEditMaps: boolean
    googleBoardUrl: string
    invitations: typeInvitarionNewUser[]
    name: string
    numberOfTerritories: number
}
