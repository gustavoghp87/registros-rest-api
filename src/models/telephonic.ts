import { ObjectId } from 'mongodb'

export type typeCallingState = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"

export const noPredicado: typeCallingState = "No predicado"

export const noContesto: typeCallingState = "No contestó"

export const contesto: typeCallingState = "Contestó"

export const noLlamar: typeCallingState = "No llamar"

export const aDejarCarta: typeCallingState = "A dejar carta"

export type typeTerritoryNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' | '50' | '51' | '52' | '53' | '54' | '55' | '56'

export type typeBlock = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' 

export type typeHousehold = {
    _id: ObjectId
    asignado?: boolean
    direccion: string
    estado: typeCallingState
    fechaUlt?: string
    inner_id: string
    manzana: typeBlock
    noAbonado: boolean
    telefono: string
    territorio: string
}

export type typeStateOfTerritory = {
    isFinished: boolean
    resetDate?: typeResetDate[]
    territorio: string
}

type typeOption = 1 | 2 | 3 | 4

export type typeResetDate = {
    date: number
    option: typeOption
}
