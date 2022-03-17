
export type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"

export const noPredicado: typeEstado = "No predicado"
export const noContesto: typeEstado = "No contestó"
export const contesto: typeEstado = "Contestó"
export const noLlamar: typeEstado = "No llamar"
export const aDejarCarta: typeEstado = "A dejar carta"

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
