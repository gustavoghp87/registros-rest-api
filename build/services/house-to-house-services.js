"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHTHIsSharedBuildingsService = exports.setHTHIsFinishedService = exports.getHTHStreetsByTerritoryService = exports.getHTHTerritoryService = exports.getHTHTerritoriesForMapService = exports.editHTHMapService = exports.editHTHObservationService = exports.deleteHTHPolygonFaceService = exports.deleteHTHObservationService = exports.deleteHTHDoNotCallService = exports.deleteHTHBuildingService = exports.createHTHTerritoriesService = exports.changeStateToHTHHouseholdService = exports.addHTHPolygonFaceService = exports.addHTHObservationService = exports.addHTHDoNotCallService = exports.addHTHBuildingService = void 0;
const server_1 = require("../server");
const telephonic_services_1 = require("./telephonic-services");
const log_services_1 = require("./log-services");
const houseToHouseDbConnection_1 = require("../services-db/houseToHouseDbConnection");
const helpers_1 = require("./helpers");
const houseToHouseDbConnection = new houseToHouseDbConnection_1.HouseToHouseDb();
const addHTHBuildingService = async (requesterUser, territoryNumber, block, face, newBuilding) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!territoryNumber || !block || !face || !newBuilding || typeof newBuilding.streetNumber !== 'number'
        || !newBuilding.households || !newBuilding.households.length)
        return 'dataError';
    newBuilding.hasCharacters = !!newBuilding.hasCharacters;
    newBuilding.hasContinuousNumbers = !!newBuilding.hasContinuousNumbers;
    newBuilding.hasLowLevel = !!newBuilding.hasLowLevel;
    if (typeof newBuilding.numberOfLevels !== 'number' || typeof newBuilding.numberPerLevel !== 'number' || !newBuilding.numberPerLevel)
        return 'dataError';
    newBuilding.households.forEach(x => {
        if (x.doorName === undefined || x.doorName === null || x.doorName === "" || typeof x.doorNumber !== 'number' || typeof x.level !== 'number')
            return 'dataError';
    });
    const hthTerritory = await getHTHTerritoryServiceWithoutPermissions(territoryNumber);
    if (!hthTerritory)
        return false;
    const currentPolygon = hthTerritory.map.polygons.find(x => x.block === block && x.face === face);
    if (!currentPolygon)
        return false;
    if (currentPolygon.buildings && currentPolygon.buildings.some(x => x.streetNumber === newBuilding.streetNumber))
        return 'alreadyExists';
    const id = +new Date();
    const building = {
        creatorId: requesterUser.id,
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
        dateOfLastSharing: 0,
        numberOfLevels: newBuilding.numberOfLevels,
        numberPerLevel: newBuilding.numberPerLevel,
        streetNumber: newBuilding.streetNumber
    };
    const success = await houseToHouseDbConnection.AddHTHBuilding(territoryNumber, block, face, building);
    return success;
};
exports.addHTHBuildingService = addHTHBuildingService;
const addHTHDoNotCallService = async (requesterUser, territoryNumber, block, face, polygonId, doNotCall) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !block || !face || !doNotCall || !doNotCall.date || !doNotCall.id || !doNotCall.streetNumber || !polygonId)
        return false;
    doNotCall.creatorId = requesterUser.id;
    doNotCall.deleted = false;
    const success = await houseToHouseDbConnection.AddHTHDoNotCall(territoryNumber, doNotCall, block, face, polygonId);
    if (success)
        server_1.logger.Add(`${requesterUser.email} agregó un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo agregar un No Tocar al territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
    return success;
};
exports.addHTHDoNotCallService = addHTHDoNotCallService;
const addHTHObservationService = async (requesterUser, territoryNumber, block, face, polygonId, observation) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !block || !face || !observation || !observation.date || !observation.id || !observation.text || !polygonId)
        return false;
    block = block.toString();
    observation.creatorId = requesterUser.id;
    observation.deleted = false;
    const success = await houseToHouseDbConnection.AddHTHObservation(territoryNumber, observation, block, face, polygonId);
    if (success)
        server_1.logger.Add(`${requesterUser.email} agregó una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo agregar una Observación al territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
    return success;
};
exports.addHTHObservationService = addHTHObservationService;
const addHTHPolygonFaceService = async (requesterUser, territoryNumber, polygon) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!territoryNumber || !polygon || !polygon.block || !polygon.face || !polygon.id ||
        !polygon.doNotCalls || !polygon.observations ||
        !polygon.coordsPoint1 || !polygon.coordsPoint2 || !polygon.coordsPoint3 ||
        !polygon.coordsPoint1.lat || !polygon.coordsPoint2.lat || !polygon.coordsPoint3.lat ||
        !polygon.coordsPoint1.lng || !polygon.coordsPoint2.lng || !polygon.coordsPoint3.lng)
        return false;
    const success = await houseToHouseDbConnection.AddHTHPolygonFace(territoryNumber, polygon);
    if (success)
        server_1.logger.Add(`${requesterUser.email} agregó una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, log_services_1.houseToHouseAdminLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo agregar una Cara al territorio ${territoryNumber} manzana ${polygon.block} cara ${polygon.face}`, log_services_1.errorLogs);
    return success;
};
exports.addHTHPolygonFaceService = addHTHPolygonFaceService;
const changeStateToHTHHouseholdService = async (requesterUser, territoryNumber, block, face, streetNumber, householdId, isChecked) => {
    // freed
    if (!territoryNumber || !block || !face || !householdId || typeof householdId !== 'number')
        return false;
    isChecked = !!isChecked;
    const success = await houseToHouseDbConnection.EditStateHTHHousehold(territoryNumber, block, face, streetNumber, householdId, isChecked);
    return success;
};
exports.changeStateToHTHHouseholdService = changeStateToHTHHouseholdService;
const createHTHTerritoriesService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    const success = await houseToHouseDbConnection.CreateHTHTerritories(requesterUser.email);
    return success;
};
exports.createHTHTerritoriesService = createHTHTerritoriesService;
const deleteHTHBuildingService = async (requesterUser, territoryNumber, block, face, streetNumber) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!territoryNumber || !block || !face || !streetNumber)
        return false;
    const success = await houseToHouseDbConnection.DeleteHTHBuilding(territoryNumber, block, face, streetNumber);
    if (success)
        server_1.logger.Add(`${requesterUser.email} eliminó el edificio de territorio ${territoryNumber} manzana ${block} cara ${face} altura ${streetNumber}`, log_services_1.houseToHouseAdminLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo eliminar el edificio de territorio ${territoryNumber} manzana ${block} cara ${face} altura ${streetNumber}`, log_services_1.errorLogs);
    return success;
};
exports.deleteHTHBuildingService = deleteHTHBuildingService;
const deleteHTHDoNotCallService = async (requesterUser, territoryNumber, block, face, doNotCallId) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !doNotCallId || !block || !face)
        return false;
    const success = await houseToHouseDbConnection.DeleteHTHDoNotCall(territoryNumber, block, face, doNotCallId);
    if (success)
        server_1.logger.Add(`${requesterUser.email} eliminó un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo eliminar un No Tocar del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
    return success;
};
exports.deleteHTHDoNotCallService = deleteHTHDoNotCallService;
const deleteHTHObservationService = async (requesterUser, territoryNumber, block, face, observationId) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !block || !face || !observationId)
        return false;
    const success = await houseToHouseDbConnection.DeleteHTHObservation(territoryNumber, block, face, observationId);
    if (success)
        server_1.logger.Add(`${requesterUser.email} eliminó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo eliminar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
    return success;
};
exports.deleteHTHObservationService = deleteHTHObservationService;
const deleteHTHPolygonFaceService = async (requesterUser, territoryNumber, block, face, faceId) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!block || !face || !faceId)
        return false;
    const hthTerritory = await getHTHTerritoryServiceWithoutPermissions(territoryNumber);
    if (!hthTerritory || !hthTerritory.map || !hthTerritory.map.polygons
        || !!hthTerritory.map.polygons.some(x => { var _a, _b, _c; return x.block === block && x.face === face && x.id === faceId && (((_a = x.buildings) === null || _a === void 0 ? void 0 : _a.length) || ((_b = x.doNotCalls) === null || _b === void 0 ? void 0 : _b.length) || ((_c = x.observations) === null || _c === void 0 ? void 0 : _c.length)); }))
        return false;
    const success = await houseToHouseDbConnection.DeleteHTHPolygonFace(territoryNumber, block, face, faceId);
    if (success)
        server_1.logger.Add(`${requesterUser.email} eliminó la cara ${face} manzana ${face} territorio ${territoryNumber}`, log_services_1.houseToHouseAdminLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo eliminar la cara ${face} manzana ${face} territorio ${territoryNumber}`, log_services_1.errorLogs);
    return success;
};
exports.deleteHTHPolygonFaceService = deleteHTHPolygonFaceService;
const editHTHObservationService = async (requesterUser, territoryNumber, block, face, observation) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !observation || !observation.id || !observation.date || !observation.text || !block || !face)
        return false;
    const success = await houseToHouseDbConnection.EditHTHObservation(territoryNumber, block, face, observation);
    if (success)
        server_1.logger.Add(`${requesterUser.email} modificó una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo modificar una Observación del territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
    return success;
};
exports.editHTHObservationService = editHTHObservationService;
const editHTHMapService = async (requesterUser, territoryNumber, editedHTHMap, editedHTHPolygons) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!editedHTHMap || !editedHTHMap.zoom || !editedHTHMap.centerCoords || !editedHTHMap.centerCoords.lat || !editedHTHMap.centerCoords.lng)
        return false;
    const centerCoords = editedHTHMap.centerCoords;
    const zoom = editedHTHMap.zoom;
    let success = await houseToHouseDbConnection.EditViewHTHMap(territoryNumber, centerCoords, zoom, requesterUser.email);
    if (success)
        server_1.logger.Add(`${requesterUser.email} editó el mapa del territorio ${territoryNumber}`, log_services_1.houseToHouseAdminLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo editar el mapa del territorio ${territoryNumber}`, log_services_1.errorLogs);
    if (success && editedHTHPolygons && editedHTHPolygons.length) {
        editedHTHPolygons.forEach(async (x) => {
            success = await houseToHouseDbConnection.EditHTHPolygon(territoryNumber, x);
            if (!success) {
                server_1.logger.Add(`${requesterUser.email} no pudo editar el mapa del territorio ${territoryNumber}`, log_services_1.errorLogs);
                return false;
            }
        });
        server_1.logger.Add(`${requesterUser.email} editó las caras del territorio ${territoryNumber}`, log_services_1.houseToHouseAdminLogs);
    }
    return success;
};
exports.editHTHMapService = editHTHMapService;
// export const getHTHTerritoriesService = async (requesterUser: typeUser): Promise<typeHTHTerritory[]|null> => {
//     if (!requesterUser) return null
//     const hthTerritories: typeHTHTerritory[]|null = await houseToHouseDbConnection.GetHTHTerritories()
//     if (hthTerritories && hthTerritories.length) {
//         hthTerritories.forEach(hthTerritory =>
//             hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
//                 if (x.doNotCalls && x.doNotCalls.length) x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true)
//                 if (x.observations && x.observations.length) x.observations = x.observations.filter(y => y.deleted !== true)
//                 return x
//             })
//         )
//     }
//     return hthTerritories
// }
const getHTHTerritoriesForMapService = async (requesterUser) => {
    if (!requesterUser)
        return null;
    const hthTerritories = await houseToHouseDbConnection.GetHTHTerritories();
    if (!hthTerritories)
        return null;
    return hthTerritories.map(x => {
        x.map.centerCoords = { lat: 0, lng: 0 };
        x.map.lastEditor = "";
        x.map.markers = [];
        if (x.map.polygons)
            x.map.polygons = x.map.polygons.map(y => {
                y.buildings = [];
                y.doNotCalls = [];
                y.observations = [];
                return y;
            });
        x.map.zoom = 0;
        return x;
    });
};
exports.getHTHTerritoriesForMapService = getHTHTerritoriesForMapService;
const getHTHTerritoryService = async (requesterUser, territoryNumber) => {
    if (!territoryNumber)
        return null;
    const hthTerritory = await getHTHTerritoryServiceWithoutPermissions(territoryNumber);
    if (!hthTerritory)
        return null;
    if (requesterUser) {
        if (requesterUser.role !== 1 && !requesterUser.hthAssignments.includes(parseInt(territoryNumber)))
            return null;
    }
    else {
        if (!hthTerritory.map.polygons.some(x => x.buildings && x.buildings.some(y => y.dateOfLastSharing && (0, helpers_1.getCurrentLocalDate)() === (0, helpers_1.getCurrentLocalDate)(y.dateOfLastSharing))))
            return null;
    }
    return hthTerritory;
};
exports.getHTHTerritoryService = getHTHTerritoryService;
const getHTHTerritoryServiceWithoutPermissions = async (territoryNumber) => {
    const hthTerritory = await houseToHouseDbConnection.GetHTHTerritory(territoryNumber);
    if (hthTerritory) {
        hthTerritory.map.polygons = hthTerritory.map.polygons.map(x => {
            if (x.doNotCalls && x.doNotCalls.length)
                x.doNotCalls = x.doNotCalls.filter(y => y.deleted !== true);
            if (x.observations && x.observations.length)
                x.observations = x.observations.filter(y => y.deleted !== true);
            return x;
        });
    }
    return hthTerritory;
};
const getHTHStreetsByTerritoryService = async (requesterUser, territoryNumber) => {
    if (!requesterUser || !territoryNumber)
        return null;
    const streets = await (0, telephonic_services_1.getTerritoryStreetsService)(territoryNumber);
    return streets;
};
exports.getHTHStreetsByTerritoryService = getHTHStreetsByTerritoryService;
const setHTHIsFinishedService = async (requesterUser, territoryNumber, block, face, polygonId, isFinished, isAll) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || isFinished === undefined)
        return false;
    if (isAll) {
        const territory = await getHTHTerritoryServiceWithoutPermissions(territoryNumber);
        if (!territory)
            return false;
        let success = true;
        if (isFinished) {
            territory.map.polygons.forEach(async (x) => {
                if (x.completionData.isFinished)
                    return;
                const success1 = await houseToHouseDbConnection.SetHTHIsFinished(territoryNumber, x.block, x.face, x.id, true);
                if (!success1)
                    success = false;
            });
        }
        else {
            territory.map.polygons.forEach(async (x) => {
                if (!x.completionData.isFinished)
                    return;
                const success1 = await houseToHouseDbConnection.SetHTHIsFinished(territoryNumber, x.block, x.face, x.id, false);
                if (!success1)
                    success = false;
            });
        }
        if (success)
            server_1.logger.Add(`${requesterUser.email} ${isFinished ? "cerró" : "abrió"} todo el territorio ${territoryNumber}`, log_services_1.houseToHouseLogs);
        else
            server_1.logger.Add(`${requesterUser.email} no pudo ${isFinished ? "cerrar" : "abrir"} todo el territorio ${territoryNumber}`, log_services_1.errorLogs);
        return success;
    }
    else {
        const success = await houseToHouseDbConnection.SetHTHIsFinished(territoryNumber, block, face, polygonId, isFinished);
        if (success)
            server_1.logger.Add(`${requesterUser.email} ${isFinished ? "cerró" : "abrió"} territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.houseToHouseLogs);
        else
            server_1.logger.Add(`${requesterUser.email} no pudo ${isFinished ? "cerrar" : "abrir"} territorio ${territoryNumber} manzana ${block} cara ${face}`, log_services_1.errorLogs);
        return success;
    }
};
exports.setHTHIsFinishedService = setHTHIsFinishedService;
const setHTHIsSharedBuildingsService = async (requesterUser, territoryNumber, block, face, polygonId, streetNumbers) => {
    if (!requesterUser)
        return false;
    if (!territoryNumber || !block || !face || !polygonId || !streetNumbers || !streetNumbers.length)
        return false;
    const success = await houseToHouseDbConnection.SetHTHIsSharedBuildings(territoryNumber, block, face, polygonId, streetNumbers);
    if (success)
        server_1.logger.Add(`${requesterUser.email} compartió edificios por WhatsApp: territorio ${territoryNumber} manzana ${block} cara ${face} números ${streetNumbers}`, log_services_1.houseToHouseLogs);
    else
        server_1.logger.Add(`${requesterUser.email} no pudo compartir edificios por WhatsApp: territorio ${territoryNumber} manzana ${block} cara ${face} números ${streetNumbers}`, log_services_1.errorLogs);
    return success;
};
exports.setHTHIsSharedBuildingsService = setHTHIsSharedBuildingsService;
