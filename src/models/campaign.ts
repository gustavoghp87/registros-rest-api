export type typeCampaignPack = {
    id: number
    desde: number
    al: number
    asignado?: string
    terminado?: boolean
    llamados?: number[]
    accessible?: boolean
}

export const noAsignado: string = "No asignado"

export const nadie: string = "Nadie"
