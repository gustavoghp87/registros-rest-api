"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.houseToHouseController = void 0;
const express_1 = __importDefault(require("express"));
const hTHServices = __importStar(require("../services/house-to-house-services"));
exports.houseToHouseController = express_1.default.Router()
    // create hth territories
    .post('/genesys', async (req, res) => {
    const success = await hTHServices.createHTHTerritoriesService(req.user);
    res.json({ success });
})
    // get hth territory
    .get('/:territoryNumber', async (req, res) => {
    const territoryNumber = req.params.territoryNumber;
    const hthTerritory = await hTHServices.getHTHTerritoryService(req.user, territoryNumber);
    res.json({ success: !!hthTerritory, hthTerritory });
})
    // get territory streets
    .get('/street/:territoryNumber', async (req, res) => {
    const territoryNumber = req.params.territoryNumber;
    const streets = await hTHServices.getHTHStreetsByTerritoryService(req.user, territoryNumber);
    res.json({ success: !!streets, streets });
})
    // add do not call
    .post('/do-not-call/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const doNotCall = req.body.doNotCall;
    const face = req.params.face;
    const polygonId = req.body.polygonId;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.addHTHDoNotCallService(req.user, territoryNumber, block, face, polygonId, doNotCall);
    res.json({ success });
})
    // add observation
    .post('/observation/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const observation = req.body.observation;
    const polygonId = req.body.polygonId;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.addHTHObservationService(req.user, territoryNumber, block, face, polygonId, observation);
    res.json({ success });
})
    // delete do not call
    .delete('/do-not-call/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const doNotCallId = req.body.doNotCallId;
    const face = req.params.face;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.deleteHTHDoNotCallService(req.user, territoryNumber, block, face, doNotCallId);
    res.json({ success });
})
    // delete observation
    .delete('/observation/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const observationId = req.body.observationId;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.deleteHTHObservationService(req.user, territoryNumber, block, face, observationId);
    res.json({ success });
})
    // edit observation
    .patch('/observation/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const observation = req.body.observation;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.editHTHObservationService(req.user, territoryNumber, block, face, observation);
    res.json({ success });
})
    // edit face finished state
    .patch('/state/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const polygonId = req.body.polygonId;
    const isAll = req.body.isAll;
    const isFinish = req.body.isFinish;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.setHTHIsFinishedService(req.user, territoryNumber, block, face, polygonId, isFinish, isAll);
    res.json({ success });
})
    // get territories for map
    .get('/map/territory', async (req, res) => {
    const hthTerritories = await hTHServices.getHTHTerritoriesForMapService(req.user);
    return res.json({ success: !!hthTerritories, hthTerritories });
})
    // edit territory map
    .patch('/map/:territoryNumber', async (req, res) => {
    const editedHTHMap = req.body.editedHTHMap;
    const editedHTHPolygons = req.body.editedHTHPolygons;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.editHTHMapService(req.user, territoryNumber, editedHTHMap, editedHTHPolygons);
    res.json({ success });
})
    // add polygon face
    .post('/map/:territoryNumber', async (req, res) => {
    const polygon = req.body.polygon;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.addHTHPolygonFaceService(req.user, territoryNumber, polygon);
    res.json({ success });
})
    // delete polygon face
    .delete('/map/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const faceId = req.body.faceId;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.deleteHTHPolygonFaceService(req.user, territoryNumber, block, face, faceId);
    res.json({ success });
})
    // add new building to face
    .post('/building/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const newBuilding = req.body.newBuilding;
    const territoryNumber = req.params.territoryNumber;
    const result = await hTHServices.addHTHBuildingService(req.user, territoryNumber, block, face, newBuilding);
    res.json({ success: result === true, dataError: result === 'dataError', alreadyExists: result === 'alreadyExists' });
})
    // modify household called state
    .patch('/building/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const householdId = req.body.householdId;
    const isChecked = req.body.isChecked;
    const streetNumber = req.body.streetNumber;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.changeStateToHTHHouseholdService(req.user, territoryNumber, block, face, streetNumber, householdId, isChecked);
    res.json({ success });
})
    // set building is shared
    .put('/building/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const polygonId = req.body.polygonId;
    const streetNumbers = req.body.streetNumbers;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.setHTHIsSharedBuildingsService(req.user, territoryNumber, block, face, polygonId, streetNumbers);
    res.json({ success });
})
    // delete hth building
    .delete('/building/:territoryNumber/:block/:face', async (req, res) => {
    const block = req.params.block;
    const face = req.params.face;
    const streetNumber = req.body.streetNumber;
    const territoryNumber = req.params.territoryNumber;
    const success = await hTHServices.deleteHTHBuildingService(req.user, territoryNumber, block, face, streetNumber);
    res.json({ success });
});
