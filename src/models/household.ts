
export type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"

export const noPredicado: typeEstado = "No predicado"
export const noContesto: typeEstado = "No contestó"
export const contesto: typeEstado = "Contestó"
export const noLlamar: typeEstado = "No llamar"
export const aDejarCarta: typeEstado = "A dejar carta"

export type typeTerritoryNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16' | '17' | '18' | '19' | '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48' | '49' | '50' | '51' | '52' | '53' | '54' | '55' | '56'

export type typeBlock = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' 

export type typeHousehold = {
    _id: Object
    inner_id: string
    territorio: string
    manzana: typeBlock
    direccion: string
    telefono: string
    estado: typeEstado
    noAbonado: boolean
    fechaUlt?: string
    asignado?: boolean
}
