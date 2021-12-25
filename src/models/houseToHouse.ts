import { typeBlock } from "./vivienda"
import { ObjectId } from 'mongodb'

type typeEstado = "No predicado" | "No contestó" | "Contestó" | "No tocar" | "Carta dejada"

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
    estado: typeEstado
    lastTime: number
}
