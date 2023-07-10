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
exports.telephonicController = void 0;
const express_1 = __importDefault(require("express"));
const territoryServices = __importStar(require("../services/telephonic-services"));
exports.telephonicController = express_1.default.Router()
    // get territory
    .get('/:territoryNumber', async (req, res) => {
    const territoryNumber = req.params.territoryNumber;
    const telephonicTerritory = await territoryServices.getTelephonicTerritoryService(req.user, territoryNumber);
    res.json({ success: !!telephonicTerritory, telephonicTerritory });
})
    // edit household
    .put('/:territoryNumber', async (req, res) => {
    const territoryNumber = req.params.territoryNumber;
    const { householdId, callingState, notSubscribed, isAssigned } = req.body;
    const household = await territoryServices.modifyHouseholdService(req.user, territoryNumber, householdId, callingState, notSubscribed, isAssigned);
    res.json({ success: !!household, household });
})
    // reset territory
    .delete('/', async (req, res) => {
    const { territoryNumber, option } = req.body;
    const modifiedCount = await territoryServices.resetTerritoryService(req.user, territoryNumber, option);
    res.json({ success: modifiedCount !== null, modifiedCount });
})
    // open and close territory
    .patch('/', async (req, res) => {
    const isFinished = req.body.isFinished;
    const territoryNumber = req.body.territoryNumber;
    const success = await territoryServices.changeStateOfTerritoryService(req.user, territoryNumber, isFinished);
    res.json({ success });
})
    // get local statistics
    .get('/statistic/local', async (req, res) => {
    const localStatistics = await territoryServices.getTelephonicLocalStatisticsService(req.user);
    res.json({ success: !!localStatistics, localStatistics });
})
    // get global statistics
    .get('/statistic/global', async (req, res) => {
    const globalStatistics = await territoryServices.getTelephonicGlobalStatisticsService(req.user);
    res.json({ success: !!globalStatistics, globalStatistics });
})
    // get territories table data
    .get('/statistics/table', async (req, res) => {
    const territoriesTableData = await territoryServices.getTelephonicStatisticsTableDataService(req.user);
    console.log("Response table:", territoriesTableData === null || territoriesTableData === void 0 ? void 0 : territoriesTableData.length);
    res.json({ success: !!territoriesTableData, territoriesTableData });
});
