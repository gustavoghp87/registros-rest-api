import { typeBlock, typeFace, typeTerritoryNumber } from '.'

export type typeHTHTerritory = {
    map: typeHTHMap
    territoryNumber: typeTerritoryNumber
}

export type typeHTHMap = {
    centerCoords: typeCoords
    lastEditor: string
    markers: typeMarker[]
    polygons: typePolygon[]
    zoom: number
}

export type typeCoords = {
    lat: number
    lng: number
}

export type typeMarker = {
    id: number
    coords: typeCoords
}

export type typePolygon = {
    block: typeBlock
    buildings: typeHTHBuilding[]
    coordsPoint1: typeCoords
    coordsPoint2: typeCoords
    coordsPoint3: typeCoords
    doNotCalls: typeDoNotCall[]
    face: typeFace
    id: number
    isFinished: boolean
    observations: typeObservation[]
    street: string
}

export type typeDoNotCall = {
    creatorId: number
    date: string
    deleted: boolean
    doorBell: string
    id: number
    streetNumber: number
}

export type typeObservation = {
    creatorId: number
    date: string
    deleted: boolean
    id: number
    text: string
}


// new buildings section

export type typeHTHBuilding = {
    creatorId: number
    dateOfLastSharing: number
    hasCharacters: boolean
    hasContinuousNumbers: boolean
    hasLowLevel: boolean
    households: typeHTHHousehold[]
    numberOfLevels: number
    numberPerLevel: number
    streetNumber: number
}

export type typeHTHHousehold = {
    dateOfLastCall: number
    doorName: string
    doorNumber: number
    id: number
    isChecked: boolean
    level: number
}
