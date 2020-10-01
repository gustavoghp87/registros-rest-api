
export interface IUser {
    _id?: Object
    role: number
    estado: string
    actividad: Object[]
    email: string
    password: string
    __v?: number
    group: number
    isAuth: boolean
    isAdmin: boolean
    asign?: number[]
}

export type territorioType = {
    _id?: string
    inner_id: string
    cuadra_id: string
    territorio: string
    manzana: string
    direccion: string
    telefono: string
    estado: string
    fechaUlt?: string
    noAbonado: boolean
}

