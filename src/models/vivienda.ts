import { typeEstado } from "./estado";

export type typeVivienda = {
    _id: Object
    inner_id: string
    territorio: string
    manzana: string
    direccion: string
    telefono: string
    estado: typeEstado
    noAbonado: boolean
    fechaUlt?: string
    asignado?: boolean
}