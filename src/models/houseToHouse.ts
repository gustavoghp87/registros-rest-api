import { typeBlock, typeTerritoryNumber } from "./household"
import { ObjectId } from 'mongodb'

export type typeFace = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export type typeHTHTerritory = {
    _id?: ObjectId
    doNotCalls: typeDoNotCall[]
    isFinished: boolean
    observations: typeObservation[]
    territory: typeTerritoryNumber
}

export type typeDoNotCall = {
    block: typeBlock
    creator: string
    date: string
    doorBell: string
    face: typeFace
    id: number
    street: string
    streetNumber: number
}

export type typeObservation = {
    block: typeBlock | ''
    creator: string
    date: string
    face: typeFace | ''
    id: number
    street: string
    text: string
}
