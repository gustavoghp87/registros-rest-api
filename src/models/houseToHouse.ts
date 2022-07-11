import { typeBlock, typeTerritoryNumber } from './household'
import { ObjectId } from 'mongodb'

export type typeFace = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export type typeHTHTerritory = {
    _id?: ObjectId
    blocks: typeBlock[]
    doNotCalls: typeDoNotCall[]
    faces: typeFace[]
    typeHTHMap: typeHTHMap
    observations: typeObservation[]
    streets: string[]
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
    block: typeBlock
    creator: string
    date: string
    face: typeFace
    id: number
    street: string
    text: string
}

export type typeFinishedFace = {
    block: typeBlock
    face: typeFace
}

///////////////////////////////////////////////////////////////////////////////////////////////

export type typeHTHMap = {
    centerCoords: typeCoords
    lastEditor: string
    markers: typeMarker[]
    polygons: typePolygon[]
    zoom: number
}

export type typeMarker = {
    id: number
    coords: typeCoords
}

export type typePolygon = {
    block: typeBlock
    coordsPoint1: typeCoords
    coordsPoint2: typeCoords
    coordsPoint3: typeCoords
    face: typeFace
    id: number
    isFinished: boolean
    street: string
}

export type typeCoords = {
    lat: number
    lng: number
}
