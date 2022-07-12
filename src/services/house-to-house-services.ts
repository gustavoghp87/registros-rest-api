import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { getTerritoryStreetsService } from './territory-services'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { typeCoords, typeDoNotCall, typeFace, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon } from '../models/houseToHouse'
import { typeUser } from '../models/user'
import { typeBlock, typeTerritoryNumber } from '../models/household'

const houseToHouseDbConnection = new HouseToHouseDb()

export const addHTHDoNotCallService = async (token: string, doNotCall: typeDoNotCall, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !block || !face || !doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.streetNumber) return false
    const success: boolean = await houseToHouseDbConnection.AddHTHDoNotCall(doNotCall, territory, block, face)
    return success
}

export const addHTHObservationService = async (token: string, observation: typeObservation, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !block || !face || !observation || !observation.date || !observation.id || !observation.text) return false
    observation.creator = user.email
    observation.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHObservation(observation, territory, block, face)
    return success
}

export const addHTHPolygonFaceService = async (token: string, polygon: typePolygon, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !polygon || !polygon.block || !polygon.face || !polygon.id || !polygon.doNotCalls || !polygon.observations) return false
    if (!polygon.coordsPoint1 || !polygon.coordsPoint2 || !polygon.coordsPoint3) return false
    if (!polygon.coordsPoint1.lat || !polygon.coordsPoint2.lat || !polygon.coordsPoint3.lat) return false
    if (!polygon.coordsPoint1.lng || !polygon.coordsPoint2.lng || !polygon.coordsPoint3.lng) return false
    await houseToHouseDbConnection.AddBlockFaceStreetToHTHTerritory(territory, polygon.block, polygon.face, polygon.street)
    const success: boolean = await houseToHouseDbConnection.AddHTHPolygonFace(polygon, territory)
    return success
}

export const createHTHTerritoriesService = async (token: string): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    const success: boolean = await houseToHouseDbConnection.CreateHTHTerritories(user.email)
    return success
}

export const deleteHTHDoNotCallService = async (token: string, doNotCallId: number, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !doNotCallId) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHDoNotCall(doNotCallId, territory)
    return success
}

export const deleteHTHObservationService = async (token: string, observationId: number, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !observationId) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHObservation(observationId, territory)
    return success
}

export const editHTHDoNotCallService = async (token: string, doNotCall: typeDoNotCall, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !doNotCall || !doNotCall.id || !doNotCall.date || !doNotCall.streetNumber) return false
    const success: boolean = await houseToHouseDbConnection.EditHTHDoNotCall(doNotCall, territory)
    return success
}

export const editHTHObservationService = async (token: string, observation: typeObservation, territory: typeTerritoryNumber): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !observation || !observation.id || !observation.date || !observation.text) return false
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(observation, territory)
    return success
}

export const editViewHTHMapService = async (token: string, territory: typeTerritoryNumber, hthMap: typeHTHMap): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!hthMap || !hthMap.zoom || !hthMap.centerCoords || !hthMap.centerCoords.lat || !hthMap.centerCoords.lng) return false
    const centerCoords: typeCoords = hthMap.centerCoords
    const zoom: number = hthMap.zoom
    const success: boolean = await houseToHouseDbConnection.EditViewHTHMap(territory, centerCoords, zoom, user.email)
    return success
}

export const getHTHTerritoryService = async (token: string, territory: typeTerritoryNumber): Promise<typeHTHTerritory|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    if (!territory) return null
    const hthTerritory: typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(territory)
    if (hthTerritory) {
        hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
            x.doNotCalls = x.doNotCalls.filter(y => y.deleted === true)
            x.observations = x.observations.filter(y => y.deleted === true)
            return x
        })
    }
    return hthTerritory
}

export const getHTHStreetsByTerritoryService = async (token: string, territory: typeTerritoryNumber): Promise<string[]|null> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return null
    if (!territory) return null
    const streets: string[]|null = await getTerritoryStreetsService(territory)
    return streets
}

export const setHTHIsFinishedService = async (token: string, isFinish: boolean, territory: typeTerritoryNumber, block: typeBlock, face: typeFace): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territory || !block || !face || typeof isFinish === undefined) return false
    const success: boolean = await houseToHouseDbConnection.SetHTHIsFinished(isFinish, territory, block, face)
    return success
}
