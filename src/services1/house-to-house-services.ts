import { getTerritoryStreetsService } from './telephonic-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { HouseToHouseDb } from '../services-db1/houseToHouseDbConnection'
import { typeBlock, typeCoords, typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber, typeUser } from '../models1'

const houseToHouseDbConnection = new HouseToHouseDb()

export const addHTHDoNotCallService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, polygonId: number, doNotCall: typeDoNotCall): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || !doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.streetNumber || !polygonId) return false
    doNotCall.creator = user.email
    doNotCall.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHDoNotCall(territoryNumber, doNotCall, block, face, polygonId)
    return success
}

export const addHTHObservationService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, polygonId: number, observation: typeObservation): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territoryNumber || !block || !face || !observation || !observation.date || !observation.id || !observation.text || !polygonId) return false
    block = block.toString() as typeBlock
    observation.creator = user.email
    observation.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHObservation(territoryNumber, observation, block, face, polygonId)
    return success
}

export const addHTHPolygonFaceService = async (token: string, territoryNumber: typeTerritoryNumber, polygon: typePolygon): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territoryNumber || !polygon || !polygon.block || !polygon.face || !polygon.id ||
        !polygon.doNotCalls || !polygon.observations ||
        !polygon.coordsPoint1 || !polygon.coordsPoint2 || !polygon.coordsPoint3 ||
        !polygon.coordsPoint1.lat || !polygon.coordsPoint2.lat || !polygon.coordsPoint3.lat ||
        !polygon.coordsPoint1.lng || !polygon.coordsPoint2.lng || !polygon.coordsPoint3.lng
    ) return false
    const success: boolean = await houseToHouseDbConnection.AddHTHPolygonFace(territoryNumber, polygon)
    return success
}

export const createHTHTerritoriesService = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const success: boolean = await houseToHouseDbConnection.CreateHTHTerritories(user.email)
    return success
}

export const deleteHTHDoNotCallService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, doNotCallId: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !doNotCallId || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHDoNotCall(territoryNumber, doNotCallId, block, face)
    return success
}

export const deleteHTHObservationService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, observationId: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territoryNumber || !observationId || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHObservation(territoryNumber, block, face, observationId)
    return success
}

export const editHTHObservationService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, observation: typeObservation): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !observation || !observation.id || !observation.date || !observation.text || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(territoryNumber, observation, block, face)
    return success
}

export const editHTHMapService = async (token: string,
    territoryNumber: typeTerritoryNumber, editedHTHMap: typeHTHMap, editedHTHPolygons: typePolygon[]): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!editedHTHMap || !editedHTHMap.zoom || !editedHTHMap.centerCoords || !editedHTHMap.centerCoords.lat || !editedHTHMap.centerCoords.lng) return false
    const centerCoords: typeCoords = editedHTHMap.centerCoords
    const zoom: number = editedHTHMap.zoom
    let success: boolean = await houseToHouseDbConnection.EditViewHTHMap(territoryNumber, centerCoords, zoom, user.email)
    if (success && editedHTHPolygons && editedHTHPolygons.length) {
        editedHTHPolygons.forEach(async x => {
            success = await houseToHouseDbConnection.EditHTHPolygon(territoryNumber, x)
            if (!success) return false
        })
    }
    return success
}

export const getHTHTerritoriesService = async (token: string): Promise<typeHTHTerritory[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    const hthTerritories: typeHTHTerritory[]|null = await houseToHouseDbConnection.GetHTHTerritories()
    if (hthTerritories && hthTerritories.length) {
        hthTerritories.forEach(hthTerritory =>
            hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
                if (x.doNotCalls && x.doNotCalls.length) x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true)
                if (x.observations && x.observations.length) x.observations = x.observations.filter(y => y.deleted !== true)
                return x
            })
        )
    }
    return hthTerritories
}

export const getHTHTerritoryService = async (token: string, territoryNumber: typeTerritoryNumber): Promise<typeHTHTerritory|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territoryNumber) return null
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territoryNumber)
    if (hthTerritory) {
        hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
            if (x.doNotCalls && x.doNotCalls.length) x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true)
            if (x.observations && x.observations.length) x.observations = x.observations.filter(y => y.deleted !== true)
            return x
        })
    }
    return hthTerritory
}

export const getHTHStreetsByTerritoryService = async (token: string, territoryNumber: typeTerritoryNumber): Promise<string[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user || !territoryNumber) return null
    const streets: string[]|null = await getTerritoryStreetsService(territoryNumber)
    return streets
}

export const setHTHIsFinishedService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, polygonId: number, isFinish: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || isFinish === undefined || !polygonId) return false
    const success: boolean = await houseToHouseDbConnection.SetHTHIsFinished(territoryNumber, isFinish, block, face, polygonId)
    return success
}
