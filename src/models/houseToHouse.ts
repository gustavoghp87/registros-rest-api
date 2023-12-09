import { typeBlock, typeFace, typeTerritoryNumber } from '.'

export type typeCoords = {
    lat: number
    lng: number
}

type typeMarker = {
    id: number
    coords: typeCoords
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

export type typeHTHBuilding = {
    creatorId: number
    dateOfLastSharing: number
    hasCharacters: boolean
    hasContinuousNumbers: boolean
    hasLowLevel: boolean
    households: typeHTHHousehold[]
    isComplex: boolean
    manager?: typeHTHHousehold
    numberOfLevels: number
    numberPerLevel: number
    reverseOrderX: boolean
    reverseOrderY: boolean
    streetNumber: number
    streetNumber2?: number
    streetNumber3?: number
}

export type typeHTHHousehold = {
    doorName: string
    doorNumber: number
    id: number
    isChecked: boolean
    level: number
    offDates: number[]
    onDates: number[]
}

export type typePolygon = {
    block: typeBlock
    buildings: typeHTHBuilding[]
    completionData: {
        completionDates: number[]
        isFinished: boolean
        reopeningDates: number[]
    }
    coordsPoint1: typeCoords
    coordsPoint2: typeCoords
    coordsPoint3: typeCoords
    doNotCalls: typeDoNotCall[]
    face: typeFace
    id: number
    observations: typeObservation[]
    street: string
}

export type typeHTHMap = {
    centerCoords: typeCoords
    lastEditor: number
    markers: typeMarker[]
    polygons: typePolygon[]
    zoom: number
}

export type typeHTHTerritory = {
    congregation: number
    map: typeHTHMap
    mapUrl?: string
    territoryNumber: typeTerritoryNumber
}
