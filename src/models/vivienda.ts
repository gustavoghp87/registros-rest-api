
type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"

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
