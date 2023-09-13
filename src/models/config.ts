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
    isDisabledEditHthMaps: boolean
    isDisabledCloseHthFaces: boolean
    isDisabledHthFaceObservations: boolean
    googleBoardUrl: string
    invitations: typeInvitarionNewUser[]
    name: string
    numberOfTerritories: number
}
