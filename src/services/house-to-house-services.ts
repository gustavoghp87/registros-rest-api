import { errorLogs, houseToHouseAdminLogs, houseToHouseLogs } from './log-services'
import { getConfigNotAuthedService, setNumberOfTerritoriesService } from './config-services'
import { getCurrentLocalDate } from './helpers'
import { getTerritoryStreetsService } from './telephonic-services'
import { HouseToHouseDb } from '../services-db/houseToHouseDbConnection'
import { logger } from '../server'
import * as types from '../models'

const houseToHouseDbConnection = new HouseToHouseDb()

export const addHTHBuildingService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, newBuilding: types.typeHTHBuilding): Promise<boolean|'dataError'|'alreadyExists'> => {
    if (!requesterUser || (requesterUser.role !== 1 && !requesterUser.hthAssignments?.includes(parseInt(territoryNumber)))) return false
    if (!territoryNumber || !block || !face || !newBuilding || typeof newBuilding.streetNumber !== 'number'
     || !newBuilding.households || !newBuilding.households.length) return 'dataError'
    newBuilding.hasCharacters = !!newBuilding.hasCharacters
    newBuilding.hasContinuousNumbers = !!newBuilding.hasContinuousNumbers
    newBuilding.hasLowLevel = !!newBuilding.hasLowLevel
    if (typeof newBuilding.numberOfLevels !== 'number' || typeof newBuilding.numberPerLevel !== 'number' || !newBuilding.numberPerLevel) return 'dataError'
    newBuilding.households.forEach(x => {
        if (x.doorName === undefined || x.doorName === null || x.doorName === "" || typeof x.doorNumber !== 'number' || typeof x.level !== 'number') return 'dataError'
    })
    const hthTerritory: types.typeHTHTerritory|null = await getHTHTerritoryServiceWithoutPermissions(requesterUser.congregation, territoryNumber)
    if (!hthTerritory) return false
    const currentPolygon: types.typePolygon|undefined = hthTerritory.map.polygons.find(x => x.block === block && x.face === face)
    if (!currentPolygon) return false
    if (currentPolygon.buildings && currentPolygon.buildings.some(x => x.streetNumber === newBuilding.streetNumber)) return 'alreadyExists'
    const id: number = +new Date()
    const building: types.typeHTHBuilding = {
        creatorId: requesterUser.id,
        dateOfLastSharing: 0,
        hasCharacters: newBuilding.hasCharacters,
        hasContinuousNumbers: newBuilding.hasContinuousNumbers,
        hasLowLevel: newBuilding.hasLowLevel,
        households: newBuilding.households.map((x, y) => ({
            doorName: x.doorName,
            doorNumber: x.doorNumber,
            id: id + y,
            isChecked: false,
            level: x.level,
            offDates: [],
            onDates: []
        })),
        isComplex: newBuilding.isComplex,
        numberOfLevels: newBuilding.numberOfLevels,
        numberPerLevel: newBuilding.numberPerLevel,
        reverseOrderX: newBuilding.reverseOrderX,
        reverseOrderY: newBuilding.reverseOrderY,
        streetNumber: newBuilding.streetNumber
    }
    if (newBuilding.manager) building.manager = newBuilding.manager
    const success: boolean = await houseToHouseDbConnection.AddHTHBuilding(requesterUser.congregation, territoryNumber, block, face, building)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} agregó un Edificio al territorio ${territoryNumber} (manzana ${block} cara ${face}): ${currentPolygon.street} ${newBuilding.streetNumber}`, houseToHouseAdminLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo agregar un Edificio al territorio ${territoryNumber} (manzana ${block} cara ${face}): ${currentPolygon.street} ${newBuilding.streetNumber}`, errorLogs)
    }
    return success
}

export const addHTHDoNotCallService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, polygonId: number, doNotCall: types.typeDoNotCall): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || !block || !face || !doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.streetNumber || !polygonId) return false
    doNotCall.creatorId = requesterUser.id
    doNotCall.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHDoNotCall(requesterUser.congregation, territoryNumber, doNotCall, block, face, polygonId)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} agregó un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face} (${doNotCall.streetNumber} ${doNotCall.doorBell ?? ''})`, houseToHouseLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo agregar un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face} (${doNotCall.streetNumber} ${doNotCall.doorBell ?? ''})`, errorLogs)
    }
    return success
}

export const addHTHObservationService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, polygonId: number, observation: types.typeObservation): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || !block || !face || !observation || !observation.date || !observation.id || !observation.text || !polygonId) return false
    block = block.toString() as types.typeBlock
    observation.creatorId = requesterUser.id
    observation.deleted = false
    const success: boolean = await houseToHouseDbConnection.AddHTHObservation(requesterUser.congregation, territoryNumber, observation, block, face, polygonId)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} agregó una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo agregar una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    }
    return success
}

export const addHTHPolygonFaceService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber, polygon: types.typePolygon): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!territoryNumber || !polygon || !polygon.block || !polygon.face || !polygon.id ||
        !polygon.doNotCalls || !polygon.observations ||
        !polygon.coordsPoint1 || !polygon.coordsPoint2 || !polygon.coordsPoint3 ||
        !polygon.coordsPoint1.lat || !polygon.coordsPoint2.lat || !polygon.coordsPoint3.lat ||
        !polygon.coordsPoint1.lng || !polygon.coordsPoint2.lng || !polygon.coordsPoint3.lng
    ) return false
    const success: boolean = await houseToHouseDbConnection.AddHTHPolygonFace(requesterUser.congregation, territoryNumber, polygon)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} agregó una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, houseToHouseAdminLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo agregar una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, errorLogs)
    }
    return success
}

export const changeStateToHTHHouseholdService = async (requesterUser: types.typeUser, congregation: number, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, streetNumber: number, householdId: number, isChecked: boolean, isManager: boolean, street: string): Promise<boolean> => {
    // freed
    if (!congregation || !territoryNumber || !block || !face || !householdId || typeof householdId !== 'number') return false
    isChecked = !!isChecked
    if (!requesterUser || (requesterUser.role !== 1 && !requesterUser.hthAssignments?.includes(parseInt(territoryNumber)))) {
        const hthTerritory = await getHTHTerritoryServiceWithoutPermissions(congregation, territoryNumber)
        if (!hthTerritory) return false
        const polygon = hthTerritory.map.polygons.find(a => a.block === block && a.face === face && a.buildings.find(b => b.streetNumber === streetNumber && !!b.dateOfLastSharing && getCurrentLocalDate() === getCurrentLocalDate(b.dateOfLastSharing)))
        if (!polygon) return false
    }
    let success = false
    if (isManager) {
        success = await houseToHouseDbConnection.EditStateHTHManagerHousehold(congregation, territoryNumber, block, face, streetNumber, isChecked)
    } else {
        success = await houseToHouseDbConnection.EditStateHTHHousehold(congregation, territoryNumber, block, face, streetNumber, householdId, isChecked)
    }
    if (success) {
        logger.Add(congregation, `${requesterUser?.email || 'Un usuario'} ${isChecked ? 'tocó' : 'desmarcó'} el timbre ID ${householdId} del edificio ${street} ${streetNumber} (territorio ${territoryNumber})`, houseToHouseLogs)
    } else {
        logger.Add(congregation, `${requesterUser?.email || 'Un usuario'} no pudo ${isChecked ? 'tocar' : 'desmarcar'} el timbre ID ${householdId} del edificio ${street} ${streetNumber} (territorio ${territoryNumber})`, errorLogs)
    }
    return success
}

export const createHTHTerritoriesService = async (
 requesterUser: types.typeUser, numberOfTerritories: number, lat: number, lng: number): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!numberOfTerritories || !Number.isInteger(numberOfTerritories) || !lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') return false
    const success: boolean = await houseToHouseDbConnection.CreateHTHTerritories(requesterUser.congregation, requesterUser.id, numberOfTerritories, lat, lng)
    if (success) {
        const successSetNumber: boolean = await setNumberOfTerritoriesService(requesterUser.congregation, requesterUser.email, numberOfTerritories)
        if (!successSetNumber) return false
    }
    return success
}

export const deleteHTHBuildingService = async (requesterUser: types.typeUser,
 territoryNumber: types.typeTerritoryNumber, block: types.typeBlock, face: types.typeFace, streetNumber: number): Promise<boolean> => {
    if (!requesterUser) return false
    if (requesterUser.role !== 1) {
        const currentBuilding = (await getHTHTerritoryServiceWithoutPermissions(requesterUser.congregation, territoryNumber))?.map.polygons.find(p => p.block === block && p.face === face)?.buildings.find(b => b.streetNumber === streetNumber)
        if (!currentBuilding || currentBuilding.creatorId !== requesterUser.id) {
            return false
        }
    }
    if (!territoryNumber || !block || !face || !streetNumber) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHBuilding(requesterUser.congregation, territoryNumber, block, face, streetNumber)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} eliminó el edificio de territorio ${territoryNumber} manzana ${block} cara ${face} altura ${streetNumber}`, houseToHouseAdminLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo eliminar el edificio de territorio ${territoryNumber} manzana ${block} cara ${face} altura ${streetNumber}`, errorLogs)
    }
    return success
}

export const deleteHTHDoNotCallService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, doNotCallId: number): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || !doNotCallId || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHDoNotCall(requesterUser.congregation, territoryNumber, block, face, doNotCallId)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} eliminó un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo eliminar un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    }
    return success
}

export const deleteHTHObservationService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, observationId: number): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || !block || !face || !observationId) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHObservation(requesterUser.congregation, territoryNumber, block, face, observationId)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} eliminó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo eliminar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    }
    return success
}

export const deleteHTHPolygonFaceService = async (requesterUser: types.typeUser,
 territoryNumber: types.typeTerritoryNumber, block: types.typeBlock, face: types.typeFace, faceId: number): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!block || !face || !faceId) return false
    const hthTerritory: types.typeHTHTerritory|null = await getHTHTerritoryServiceWithoutPermissions(requesterUser.congregation, territoryNumber)
    if (!hthTerritory || !hthTerritory.map || !hthTerritory.map.polygons
        || !!hthTerritory.map.polygons.some(x => x.block === block && x.face === face && x.id === faceId && (x.buildings?.length || x.doNotCalls?.length || x.observations?.length))
    ) return false
    const success: boolean = await houseToHouseDbConnection.DeleteHTHPolygonFace(requesterUser.congregation, territoryNumber, block, face, faceId)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} eliminó la cara ${face} manzana ${face} territorio ${territoryNumber}`, houseToHouseAdminLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo eliminar la cara ${face} manzana ${face} territorio ${territoryNumber}`, errorLogs)
    }
    return success
}

export const editHTHObservationService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, observation: types.typeObservation): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || !observation || !observation.id || !observation.date || !observation.text || !block || !face) return false
    const success: boolean = await houseToHouseDbConnection.EditHTHObservation(requesterUser.congregation, territoryNumber, block, face, observation)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} modificó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo modificar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
    }
    return success
}

export const editHTHMapService = async (requesterUser: types.typeUser,
    territoryNumber: types.typeTerritoryNumber, editedHTHMap: types.typeHTHMap, editedHTHPolygons: types.typePolygon[]): Promise<boolean> => {
    if (!requesterUser || requesterUser.role !== 1) return false
    if (!editedHTHMap || !editedHTHMap.zoom || !editedHTHMap.centerCoords || !editedHTHMap.centerCoords.lat || !editedHTHMap.centerCoords.lng) return false
    const centerCoords: types.typeCoords = editedHTHMap.centerCoords
    const zoom: number = editedHTHMap.zoom
    let success: boolean = await houseToHouseDbConnection.EditViewHTHMap(requesterUser.congregation, territoryNumber, centerCoords, zoom, requesterUser.id)
    if (success) {
        logger.Add(requesterUser.congregation, `${requesterUser.email} editó el mapa del territorio ${territoryNumber}`, houseToHouseAdminLogs)
    } else {
        logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo editar el mapa del territorio ${territoryNumber}`, errorLogs)
    }
    if (success && editedHTHPolygons && editedHTHPolygons.length) {
        editedHTHPolygons.forEach(async x => {
            success = await houseToHouseDbConnection.EditHTHPolygon(requesterUser.congregation, territoryNumber, x)
            if (!success) {
                logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo editar el mapa del territorio ${territoryNumber}`, errorLogs)
                return false
            }
        })
        logger.Add(requesterUser.congregation, `${requesterUser.email} editó las caras del territorio ${territoryNumber}`, houseToHouseAdminLogs)
    }
    return success
}

// export const getHTHTerritoriesService = async (): Promise<types.typeHTHTerritory[]|null> => {
//     // if (!requesterUser) return null
//     const hthTerritories: types.typeHTHTerritory[]|null = await houseToHouseDbConnection.GetHTHTerritories(1)
//     // if (hthTerritories && hthTerritories.length) {
//     //     hthTerritories.forEach(hthTerritory =>
//     //         hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
//     //             if (x.doNotCalls && x.doNotCalls.length) x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true)
//     //             if (x.observations && x.observations.length) x.observations = x.observations.filter(y => y.deleted !== true)
//     //             return x
//     //         })
//     //     )
//     // }
//     return hthTerritories
// }

export const getHTHTerritoriesForStatisticsService = async (requesterUser: types.typeUser): Promise<types.typeHTHTerritory[]|null> => {
    if (!requesterUser || requesterUser.role !== 1) return null
    const hthTerritories: types.typeHTHTerritory[]|null = await houseToHouseDbConnection.GetHTHTerritories(requesterUser.congregation)
    return hthTerritories
}

export const getHTHTerritoriesForMapService = async (requesterUser: types.typeUser): Promise<types.typeHTHTerritory[]|null> => {
    if (!requesterUser) return null
    const hthTerritories: types.typeHTHTerritory[]|null = await houseToHouseDbConnection.GetHTHTerritories(requesterUser.congregation)
    if (!hthTerritories) return null
    const blinded = hthTerritories.map(x => {
        x.map.centerCoords = { lat: 0, lng: 0 }
        x.map.lastEditor = 0
        x.map.markers = []
        if (x.map.polygons) {
            x.map.polygons = x.map.polygons.map(y => {
                y.buildings = []
                y.doNotCalls = []
                y.observations = []
                return y
            })
        }
        x.map.zoom = 0
        return x
    })
    return blinded
}

export const getHTHBuildingService = async (congregation: number, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, streetNumber: number): Promise<types.typeHTHTerritory|string|null> => {
    if (!congregation || !territoryNumber || !block || !face || !streetNumber) return null
    const hthTerritory = await getHTHTerritoryServiceWithoutPermissions(congregation, territoryNumber)
    const polygon = hthTerritory?.map.polygons.find(p => p.block === block && p.face === face)
    if (!hthTerritory || !polygon) return null
    const building: types.typeHTHBuilding|undefined = polygon?.buildings.find(b => b.streetNumber === streetNumber)
    if (!building) return null
    if (!building.dateOfLastSharing || getCurrentLocalDate() !== getCurrentLocalDate(building.dateOfLastSharing)) {
        return 'notSharedToday'
    }
    return {
        congregation,
        territoryNumber,
        map: {
            ...hthTerritory.map,
            lastEditor: 0,
            polygons: [{
                ...polygon,
                completionData: { completionDates: [], isFinished: false, reopeningDates: [] },
                doNotCalls: [],
                observations: [],
                buildings: [building]
            }]
        }
    }
}

export const getHTHTerritoryService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber): Promise<types.typeHTHTerritory|null> => {
    if (!requesterUser || !territoryNumber) return null
    const config = await getConfigNotAuthedService(requesterUser.congregation)
    if (requesterUser.role !== 1 && !requesterUser.hthAssignments?.includes(parseInt(territoryNumber)) && config?.isDisabledHthBuildingsForUnassignedUsers) {
        return null
    }
    const hthTerritory: types.typeHTHTerritory|null = await getHTHTerritoryServiceWithoutPermissions(requesterUser.congregation, territoryNumber)
    if (!hthTerritory) return null
    return hthTerritory
}

const getHTHTerritoryServiceWithoutPermissions = async (congregation: number, territoryNumber: types.typeTerritoryNumber): Promise<types.typeHTHTerritory|null> => {
    const hthTerritory: types.typeHTHTerritory|null = await houseToHouseDbConnection.GetHTHTerritory(congregation, territoryNumber)
    if (hthTerritory) {
        hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
            if (x.doNotCalls && x.doNotCalls.length) x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true)
            if (x.observations && x.observations.length) x.observations = x.observations.filter(y => y.deleted !== true)
            return x
        })
    }
    return hthTerritory
}

export const getHTHStreetsByTerritoryService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber): Promise<string[]|null> => {
    if (!requesterUser || !territoryNumber) return null
    const streets: string[]|null = await getTerritoryStreetsService(requesterUser.congregation, territoryNumber)
    return streets
}

export const setHTHIsFinishedService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, polygonId: number, isFinished: boolean, isAll: boolean): Promise<boolean> => {
    if (!requesterUser) return false
    if (!territoryNumber || isFinished === undefined) return false
    if (isAll) {
        const territory = await getHTHTerritoryServiceWithoutPermissions(requesterUser.congregation, territoryNumber)
        if (!territory) return false
        let success: boolean = true
        if (isFinished) {
            territory.map.polygons.forEach(async x => {
                if (!!x.completionData?.isFinished) return
                const success1: boolean = await houseToHouseDbConnection.SetHTHIsFinished(requesterUser.congregation, territoryNumber, x.block, x.face, x.id, true)
                if (!success1) success = false
            })
        } else {
            territory.map.polygons.forEach(async x => {
                if (!x.completionData?.isFinished) return
                const success1: boolean = await houseToHouseDbConnection.SetHTHIsFinished(requesterUser.congregation, territoryNumber, x.block, x.face, x.id, false)
                if (!success1) success = false
            })
        }
        if (success) {
            logger.Add(requesterUser.congregation, `${requesterUser.email} ${isFinished ? "cerró" : "abrió"} todo el territorio ${territoryNumber}`, houseToHouseLogs)
        } else {
            logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo ${isFinished ? "cerrar" : "abrir"} todo el territorio ${territoryNumber}`, errorLogs)
        }
        return success
    } else {
        const success: boolean = await houseToHouseDbConnection.SetHTHIsFinished(requesterUser.congregation, territoryNumber, block, face, polygonId, isFinished)
        if (success) {
            logger.Add(requesterUser.congregation, `${requesterUser.email} ${isFinished ? "cerró" : "abrió"} territorio ${territoryNumber} manzana ${block} cara ${face}`, houseToHouseLogs)
        } else {
            logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo ${isFinished ? "cerrar" : "abrir"} territorio ${territoryNumber} manzana ${block} cara ${face}`, errorLogs)
        }
        return success
    }
}

export const setHTHIsSharedBuildingsService = async (requesterUser: types.typeUser, territoryNumber: types.typeTerritoryNumber,
 block: types.typeBlock, face: types.typeFace, polygonId: number, streetNumbers: number[]): Promise<boolean> => {
    if (!requesterUser || (requesterUser.role !== 1 && !requesterUser.hthAssignments?.includes(parseInt(territoryNumber)))) return false
    if (!territoryNumber || !block) return false
    let success: boolean = true
    if (!face || !polygonId || !streetNumbers || !streetNumbers.length) {
        success = await houseToHouseDbConnection.SetHTHIsSharedAllBuildings(requesterUser.congregation, territoryNumber, block)
        if (success) {
            logger.Add(requesterUser.congregation, `${requesterUser.email} compartió todos los edificios de la manzana ${block} territorio ${territoryNumber} por WhatsApp`, houseToHouseLogs)
        } else {
            logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo compartir edificios por WhatsApp: territorio ${territoryNumber} manzana ${block}`, errorLogs)
        }
    } else {
        success = await houseToHouseDbConnection.SetHTHIsSharedBuildings(requesterUser.congregation, territoryNumber, block, face, polygonId, streetNumbers)
        if (success) {
            logger.Add(requesterUser.congregation, `${requesterUser.email} compartió edificios por WhatsApp: territorio ${territoryNumber} manzana ${block} cara ${face} números ${streetNumbers}`, houseToHouseLogs)
        } else {
            logger.Add(requesterUser.congregation, `${requesterUser.email} no pudo compartir edificios por WhatsApp: territorio ${territoryNumber} manzana ${block} cara ${face} números ${streetNumbers}`, errorLogs)
        }
    }
    return success
}
