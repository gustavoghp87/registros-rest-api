
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
}

export type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No llamar" | "A dejar carta"


/////////////////////////////////////////////////////////////////////////////////////

export type typeUser = {
    _id?: Object
    role: number
    estado: boolean
    email: string
    password: string
    __v?: number
    group: number
    isAuth?: boolean
    isAdmin?: boolean
    asign?: number[]
}

export type territorioType = {
    _id?: string
    inner_id: string
    territorio: string
    manzana: string
    direccion: string
    telefono: string
    estado: string
    fechaUlt?: string
    noAbonado: boolean
}
