"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HouseToHouseDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollHTHTerritories);
class HouseToHouseDb {
    async AddHTHBuilding(territoryNumber, block, face, building) {
        try {
            if (!territoryNumber || !block || !face || !building)
                throw new Error("No llegaron datos");
            const result = await getCollection().updateOne({ territoryNumber }, { $push: { 'map.polygons.$[x].buildings': building } }, { arrayFilters: [{ 'x.block': block, 'x.face': face }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AddHTHBuilding() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async AddHTHDoNotCall(territoryNumber, doNotCall, block, face, polygonId) {
        try {
            if (!doNotCall || !territoryNumber || !block || !face)
                throw new Error("No llegó no tocar o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $push: { 'map.polygons.$[x].doNotCalls': doNotCall } }, { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AddHTHDoNotCall() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async AddHTHObservation(territoryNumber, observation, block, face, polygonId) {
        try {
            if (!observation || !territoryNumber || !block || !face)
                throw new Error("No llegó observación o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $push: { 'map.polygons.$[x].observations': observation } }, { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async AddHTHPolygonFace(territoryNumber, polygon) {
        try {
            if (!polygon || !territoryNumber)
                throw new Error("No llegó polígono o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $push: { 'map.polygons': polygon } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AddHTHObservation() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async CreateHTHTerritories(email) {
        try {
            for (let i = 1; i <= 56; i++) {
                console.log("Creating hth territory", i);
                const hthTerritory = {
                    map: {
                        centerCoords: {
                            lat: -34.6324233875622,
                            lng: -58.455761358048456
                        },
                        lastEditor: email,
                        markers: [],
                        polygons: [],
                        zoom: 17
                    },
                    territoryNumber: i.toString()
                };
                await getCollection().insertOne(hthTerritory);
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async DeleteHTHBuilding(territoryNumber, block, face, streetNumber) {
        try {
            if (!territoryNumber || !block || !face || !streetNumber)
                return false;
            const result = await getCollection().updateOne({ territoryNumber }, { $pull: { 'map.polygons.$[x].buildings': { streetNumber } } }, { arrayFilters: [{ 'x.block': block, 'x.face': face }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló DeleteHTHBuilding() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async DeleteHTHDoNotCall(territoryNumber, block, face, doNotCallId) {
        try {
            if (!doNotCallId || !territoryNumber || !block || !face)
                throw new Error("No llegó no tocar id o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.polygons.$[i].doNotCalls.$[j].deleted': true } }, { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': doNotCallId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló DeleteHTHDoNotCall() territorio ${territoryNumber} id ${doNotCallId}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async DeleteHTHObservation(territoryNumber, block, face, observationId) {
        try {
            if (!observationId || !territoryNumber || !block || !face)
                throw new Error("No llegó observación id o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.polygons.$[i].observations.$[j].deleted': true } }, { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observationId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló DeleteHTHObservation() territorio ${territoryNumber} id ${observationId}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async DeleteHTHPolygonFace(territoryNumber, block, face, faceId) {
        try {
            if (!territoryNumber || !block || !face || !faceId)
                throw new Error("Faltan datos");
            const result = await getCollection().updateOne({ territoryNumber }, { $pull: { 'map.polygons': { block, face, id: faceId } } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló DeleteHTHPolygonFace() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditHTHObservation(territoryNumber, block, face, observation) {
        try {
            if (!observation || !territoryNumber || !block || !face)
                throw new Error("No llegaron observaciones o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.polygons.$[i].observations.$[j].text': observation.text } }, { arrayFilters: [{ 'i.block': block, 'i.face': face }, { 'j.id': observation.id }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló EditHTHObservation() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditHTHPolygon(territoryNumber, polygon) {
        try {
            if (!polygon || !territoryNumber)
                throw new Error("No llegaron el polígono o el territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: {
                    'map.polygons.$[x].coordsPoint1': polygon.coordsPoint1,
                    'map.polygons.$[x].coordsPoint2': polygon.coordsPoint2,
                    'map.polygons.$[x].coordsPoint3': polygon.coordsPoint3
                } }, { arrayFilters: [{ 'x.block': polygon.block, 'x.face': polygon.face, 'x.id': polygon.id }] });
            return true; // do not use .modifiedCount
        }
        catch (error) {
            server_1.logger.Add(`Falló EditHTHPolygon() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditStateHTHHousehold(territoryNumber, block, face, streetNumber, householdId, isChecked) {
        try {
            if (!territoryNumber || !block || !face || !streetNumber || !householdId)
                throw new Error("No llegaron datos");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.polygons.$[x].buildings.$[y].households.$[z].isChecked': isChecked } }, { arrayFilters: [{ 'x.block': block, 'x.face': face }, { 'y.streetNumber': streetNumber }, { 'z.id': householdId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló EditStateHTHHousehold() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditViewHTHMap(territoryNumber, centerCoords, zoom, lastEditor) {
        try {
            if (!centerCoords || !zoom || !territoryNumber)
                throw new Error("No llegaron coordenadas, zoom o territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.centerCoords': centerCoords, 'map.zoom': zoom, 'map.lastEditor': lastEditor } });
            return true; // do not use .modifiedCount
        }
        catch (error) {
            server_1.logger.Add(`Falló EditViewHTHMap() territorio ${territoryNumber} ${centerCoords} ${zoom}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async GetHTHTerritories() {
        var _a;
        try {
            const hthTerritories = await ((_a = getCollection().find()) === null || _a === void 0 ? void 0 : _a.toArray());
            return hthTerritories !== null && hthTerritories !== void 0 ? hthTerritories : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetHTHTerritories()`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetHTHTerritory(territoryNumber) {
        try {
            if (!territoryNumber)
                throw new Error("No llegó territorio");
            const hthTerritory = await getCollection().findOne({ territoryNumber });
            return hthTerritory !== null && hthTerritory !== void 0 ? hthTerritory : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetHTHTerritory() territorio ${territoryNumber}`, log_services_1.errorLogs);
            return null;
        }
    }
    async SetHTHIsFinished(territoryNumber, block, face, polygonId, isFinished) {
        try {
            if (!territoryNumber || !block || !face || isFinished === undefined || !polygonId)
                throw new Error("No llegaron datos");
            if (isFinished) {
                const result = await getCollection().updateOne({ territoryNumber }, {
                    $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                    $addToSet: { 'map.polygons.$[x].completionData.completionDates': +new Date() }
                }, { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] });
                return !!result.modifiedCount;
            }
            else {
                const result = await getCollection().updateOne({ territoryNumber }, {
                    $set: { 'map.polygons.$[x].completionData.isFinished': isFinished },
                    $addToSet: { 'map.polygons.$[x].completionData.reopeningDates': +new Date() }
                }, { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }] });
                return !!result.modifiedCount;
            }
        }
        catch (error) {
            server_1.logger.Add(`Falló SetHTHIsFinished() territorio ${territoryNumber} ${block} ${face} ${polygonId}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async SetHTHIsSharedBuildings(territoryNumber, block, face, polygonId, streetNumbers) {
        try {
            if (!territoryNumber || !block || !face || !polygonId || !streetNumbers || !streetNumbers.length)
                throw new Error("No llegaron datos");
            console.log("db");
            streetNumbers.forEach(async (streetNumber) => {
                const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'map.polygons.$[x].buildings.$[y].dateOfLastSharing': +new Date() } }, { arrayFilters: [{ 'x.block': block, 'x.face': face, 'x.id': polygonId }, { 'y.streetNumber': streetNumber }] });
                if (!!result.modifiedCount)
                    return false;
            });
            return true;
        }
        catch (error) {
            server_1.logger.Add(`Falló SetHTHIsSharedBuildings() territorio ${territoryNumber} ${block} ${face}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
}
exports.HouseToHouseDb = HouseToHouseDb;
