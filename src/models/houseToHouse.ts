import { typeBlock } from "./vivienda"
import { ObjectId } from 'mongodb'

type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No tocar" | "Carta dejada"

export type typeHTHBuilding = {
    _id?: ObjectId
    territory: string
    manzana?: typeBlock           // ?
    street: string
    streetNumber: number
    households: typeHTHHousehold[]
}

export type typeHTHHousehold = {
    isChecked: boolean         // provisional
    piso: string
    depto: string
    idNumber: number
    estado: typeEstado
    lastTime: number
}
