import { typeBlock } from "./household"
import { ObjectId } from 'mongodb'

type typeEstadoHTH = "No predicado" | "No contestó" | "Contestó" | "No tocar" | "Carta dejada"

export const noPredicadoHTH: typeEstadoHTH = "No predicado"

export type typeHTHBuilding = {
    _id?: ObjectId
    households: typeHTHHousehold[]
    manzana?: typeBlock           // ?
    street: string
    streetNumber: number
    territory: string
    pisosX: number
    deptosX: number
    conLetras: boolean
    numCorrido: boolean
    sinPB: boolean
}

export type typeHTHHousehold = {
    isChecked: boolean         // provisional
    piso: string
    depto: string
    idNumber: number
    estado: typeEstadoHTH
    lastTime: number
}
