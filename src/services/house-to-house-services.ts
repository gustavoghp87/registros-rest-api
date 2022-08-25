import { getTerritoryStreetsService } from './telephonic-services'
import { logger } from '../server'
import { getActivatedAdminByAccessTokenService, getActivatedUserByAccessTokenService } from './user-services'
import { errorLogs, houseToHouseAdminLogs, houseToHouseLogs } from './log-services'
import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { typeBlock, typeCoords, typeDoNotCall, typeFace, typeHTHBuilding, typeHTHMap, typeHTHTerritory, typeObservation, typePolygon, typeTerritoryNumber, typeUser } from '../models'

const houseToHouseDbConnection = new HouseToHouseDb()

export const addHTHBuildingService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, newBuilding: typeHTHBuilding): Promise<boolean|'dataError'|'alreadyExists'> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || !newBuilding || typeof newBuilding.streetNumber !== 'number'
     || !newBuilding.households || !newBuilding.households.length) return 'dataError'
    newBuilding.hasCharacters = !!newBuilding.hasCharacters
    newBuilding.hasContinuousNumbers = !!newBuilding.hasContinuousNumbers
    newBuilding.hasLowLevel = !!newBuilding.hasLowLevel
    if (typeof newBuilding.numberOfLevels !== 'number' || typeof newBuilding.numberPerLevel !== 'number' || !newBuilding.numberPerLevel) return 'dataError'
    newBuilding.households.forEach(x => {
        if (x.doorName === undefined || x.doorName === null || x.doorName === "" || typeof x.doorNumber !== 'number' || typeof x.level !== 'number') return 'dataError'
    })
    const hthTerritory: typeHTHTerritory|null = await getHTHTerritoryServiceWithoutPermissions(territoryNumber)
    if (!hthTerritory) return false
    if (hthTerritory.map.polygons
        .find(x => x.block === block && x.face === face)?.buildings
        .some(x => x.streetNumber === newBuilding.streetNumber)
    ) return 'alreadyExists'
    const id: number = +new Date()
    const building: typeHTHBuilding = {
        hasCharacters: newBuilding.hasCharacters,
        hasContinuousNumbers: newBuilding.hasContinuousNumbers,
        hasLowLevel: newBuilding.hasLowLevel,
        households: newBuilding.households.map((x, y) => ({
            dateOfLastCall: 0,
            doorName: x.doorName,
            doorNumber: x.doorNumber,
            id: id + y,
            isChecked: false,
            level: x.level
        })),
        numberOfLevels: newBuilding.numberOfLevels,
        numberPerLevel: newBuilding.numberPerLevel,
        streetNumber: newBuilding.streetNumber
    }
    const success: boolean = await houseToHouseDbConnection.AddHTHBuilding(territoryNumber, block, face, building)
    return success
}

export const addHTHDoNotCallService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, polygonId: number, doNotCall: typeDoNotCall): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || !doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.streetNumber || !polygonId) return false
    doNotCall.creator = user.email
    doNotCall.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHDoNotCall(territoryNumber, doNotCall, block, face, polygonId)
    if (success) logger.Add(`${user.email} agregó un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo agregar un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
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
    if (success) logger.Add(`${user.email} agregó una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo agregar una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
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
    if (success) logger.Add(`${user.email} agregó una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, houseToHouseAdminLogs)
    else logger.Add(`${user.email} no pudo agregar una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, errorLogs)
    return success
}

export const changeStateToHTHHouseholdService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, streetNumber: number, householdId: number, isChecked: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedUserByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || !householdId || typeof householdId !== 'number') return false
    isChecked = !!isChecked
    const success: boolean = await houseToHouseDbConnection.EditStateHTHHousehold(territoryNumber, block, face, streetNumber, householdId, isChecked)
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
    if (success) logger.Add(`${user.email} eliminó un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo eliminar un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    return success
}

export const deleteHTHObservationService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, observationId: number): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user || !territoryNumber || !observationId || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHObservation(territoryNumber, block, face, observationId)
    if (success) logger.Add(`${user.email} eliminó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo eliminar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    return success
}

export const editHTHObservationService = async (token: string, territoryNumber: typeTerritoryNumber,
 block: typeBlock, face: typeFace, observation: typeObservation): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !observation || !observation.id || !observation.date || !observation.text || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(territoryNumber, observation, block, face)
    if (success) logger.Add(`${user.email} modificó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo modificar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
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
    if (success) logger.Add(`${user.email} editó el mapa del territorio ${territoryNumber}`, houseToHouseAdminLogs)
    else logger.Add(`${user.email} no pudo editar el mapa del territorio ${territoryNumber}`, errorLogs)
    if (success && editedHTHPolygons && editedHTHPolygons.length) {
        editedHTHPolygons.forEach(async x => {
            success = await houseToHouseDbConnection.EditHTHPolygon(territoryNumber, x)
            if (!success) {
                logger.Add(`${user.email} no pudo editar el mapa del territorio ${territoryNumber}`, errorLogs)
                return false
            }
        })
        logger.Add(`${user.email} editó las caras del territorio ${territoryNumber}`, houseToHouseAdminLogs)
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
    const hthTerritory: typeHTHTerritory|null = await getHTHTerritoryServiceWithoutPermissions(territoryNumber)
    return hthTerritory
}

const getHTHTerritoryServiceWithoutPermissions = async (territoryNumber: typeTerritoryNumber): Promise<typeHTHTerritory|null> => {
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
 block: typeBlock, face: typeFace, polygonId: number, isFinished: boolean): Promise<boolean> => {
    const user: typeUser|null = await getActivatedAdminByAccessTokenService(token)
    if (!user) return false
    if (!territoryNumber || !block || !face || isFinished === undefined || !polygonId) return false
    const success: boolean = await houseToHouseDbConnection.SetHTHIsFinished(territoryNumber, isFinished, block, face, polygonId)
    if (success) logger.Add(`${user.email} ${isFinished ? "cerró" : "abrió"} territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    else logger.Add(`${user.email} no pudo ${isFinished ? "cerrar" : "abrir"} territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    return success
}
