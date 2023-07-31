"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTerritoryService = exports.modifyHouseholdService = exports.getTelephonicTerritoryService = exports.getTerritoryStreetsService = exports.getTelephonicStatisticsTableDataService = exports.getTelephonicLocalStatisticsService = exports.getTelephonicGlobalStatisticsService = exports.getAllTelephonicTerritoriesNotAuthService = exports.changeStateOfTerritoryService = void 0;
const server_1 = require("../server");
const user_services_1 = require("./user-services");
const log_services_1 = require("./log-services");
const telephonicDbConnection_1 = require("../services-db/telephonicDbConnection");
const helpers_1 = require("./helpers");
const telephonicDbConnection = new telephonicDbConnection_1.TelephonicDb();
const changeStateOfTerritoryService = async (requesterUser, territoryNumber, isFinished, user) => {
    if (!requesterUser || !territoryNumber)
        return false;
    if (requesterUser.role !== 1 && !(0, helpers_1.isTerritoryAssignedToUserService)(requesterUser, territoryNumber))
        return false;
    isFinished = !!isFinished;
    const success = await telephonicDbConnection.ChangeStateOfTerritory(territoryNumber, isFinished);
    if (!success) {
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo cambiar territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, log_services_1.errorLogs);
        return false;
    }
    server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambia territorio ${territoryNumber} a ${isFinished ? 'terminado' : 'abierto'}`, log_services_1.telephonicStateLogs);
    if (isFinished)
        await (0, user_services_1.deallocateMyTLPTerritoryService)(requesterUser, territoryNumber);
    return true;
};
exports.changeStateOfTerritoryService = changeStateOfTerritoryService;
const getAllTelephonicTerritoriesNotAuthService = async () => {
    // without permission filter / 
    const phoneTerritories = await telephonicDbConnection.GetAllTelephonicTerritories();
    return phoneTerritories;
};
exports.getAllTelephonicTerritoriesNotAuthService = getAllTelephonicTerritoriesNotAuthService;
const getTelephonicGlobalStatisticsService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return null;
    const telephonicTerritories = await telephonicDbConnection.GetAllTelephonicTerritories();
    if (!telephonicTerritories)
        return null;
    telephonicTerritories.forEach(x => x.households = (0, helpers_1.filterHouses)(x.households));
    const telephonicGlobalStatistics = {
        numberOf_ADejarCarta: 0,
        numberOf_Contesto: 0,
        numberOf_NoAbonado: 0,
        numberOf_NoContesto: 0,
        numberOf_NoLlamar: 0,
        numberOf_FreePhones: 0,
        numberOfHouseholds: 0
    };
    telephonicTerritories.forEach(x => {
        x.households.forEach(y => {
            telephonicGlobalStatistics.numberOfHouseholds++;
            if (y.callingState === 'No predicado' && !y.notSubscribed)
                telephonicGlobalStatistics.numberOf_FreePhones++;
            else if (y.callingState === 'A dejar carta' && !y.notSubscribed)
                telephonicGlobalStatistics.numberOf_ADejarCarta++;
            else if (y.callingState === 'Contestó' && !y.notSubscribed)
                telephonicGlobalStatistics.numberOf_Contesto++;
            else if (y.callingState === 'No contestó' && !y.notSubscribed)
                telephonicGlobalStatistics.numberOf_NoContesto++;
            else if (y.callingState === 'No llamar' && !y.notSubscribed)
                telephonicGlobalStatistics.numberOf_NoLlamar++;
            if (y.notSubscribed)
                telephonicGlobalStatistics.numberOf_NoAbonado++;
        });
    });
    return telephonicGlobalStatistics;
};
exports.getTelephonicGlobalStatisticsService = getTelephonicGlobalStatisticsService;
const getTelephonicLocalStatisticsService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return null;
    const telephonicTerritories = await telephonicDbConnection.GetAllTelephonicTerritories();
    if (!telephonicTerritories)
        return null;
    telephonicTerritories.forEach(x => x.households = (0, helpers_1.filterHouses)(x.households));
    const telephonicLocalStatistics = [];
    for (let i = 0; i < telephonicTerritories.length; i++) {
        const localStatistics = {
            isFinished: telephonicTerritories[i].stateOfTerritory.isFinished,
            numberOf_ADejarCarta: 0,
            numberOf_Contesto: 0,
            numberOf_NoAbonado: 0,
            numberOf_NoContesto: 0,
            numberOf_NoLlamar: 0,
            numberOf_FreePhones: 0,
            numberOfHouseholds: 0,
            stateOfTerritory: { isFinished: false, resetDates: [] },
            territoryNumber: (i + 1).toString()
        };
        telephonicTerritories[i].households.forEach(x => {
            localStatistics.numberOfHouseholds++;
            if (x.callingState === 'No predicado' && !x.notSubscribed)
                localStatistics.numberOf_FreePhones++;
            else if (x.callingState === 'A dejar carta' && !x.notSubscribed)
                localStatistics.numberOf_ADejarCarta++;
            else if (x.callingState === 'Contestó' && !x.notSubscribed)
                localStatistics.numberOf_Contesto++;
            else if (x.callingState === 'No contestó' && !x.notSubscribed)
                localStatistics.numberOf_NoContesto++;
            else if (x.callingState === 'No llamar' && !x.notSubscribed)
                localStatistics.numberOf_NoLlamar++;
            if (x.notSubscribed)
                localStatistics.numberOf_NoAbonado++;
        });
        localStatistics.stateOfTerritory = telephonicTerritories[i].stateOfTerritory;
        telephonicLocalStatistics.push(localStatistics);
    }
    return telephonicLocalStatistics;
};
exports.getTelephonicLocalStatisticsService = getTelephonicLocalStatisticsService;
const getTelephonicStatisticsTableDataService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return null;
    const territories = await (0, exports.getAllTelephonicTerritoriesNotAuthService)();
    console.log("Territories OK", territories === null || territories === void 0 ? void 0 : territories.length);
    const users = await (0, user_services_1.getUsersNotAuthService)();
    console.log("Users OK", users === null || users === void 0 ? void 0 : users.length);
    // let territoriesTableData: typeTerritoryRow[] = []
    // const promisesArray: any[] = []
    // promisesArray.push(new Promise(async (resolve, reject) => {
    //     const territories = await getAllTelephonicTerritoriesNotAuthService()
    //     resolve(territories)
    // }))
    // promisesArray.push(new Promise(async (resolve, reject) => {
    //     const users = await getUsersNotAuthService()
    //     resolve(users)
    // }))
    // const [territories, users] = await Promise.all(promisesArray) as [typeTelephonicTerritory[], typeUser[]]
    if (!territories || !users)
        return null;
    let territoriesTableData = [];
    territories.forEach(t => {
        var _a;
        const left = { ...t }.households.filter(x => x.doorBell && x.callingState === 'No predicado' && !x.notSubscribed).length;
        const total = { ...t }.households.filter(x => x.doorBell).length;
        const leftRel = total === 0 ? '-' : (left / total * 100).toFixed(1) + '%';
        const lastDate = new Date((_a = { ...t }.households.reduce((a, b) => a.dateOfLastCall > b.dateOfLastCall ? a : b)) === null || _a === void 0 ? void 0 : _a.dateOfLastCall);
        const last = `${lastDate.getFullYear()}-${('0' + (lastDate.getMonth() + 1)).slice(-2)}-${('0' + lastDate.getDate()).slice(-2)}`;
        const row = {
            territoryNumber: parseInt(t.territoryNumber),
            assigned: [],
            opened: !t.stateOfTerritory.isFinished,
            left,
            total,
            leftRel,
            last
        };
        territoriesTableData.push(row);
    });
    const territoriesTableData1 = [...territoriesTableData].sort((a, b) => a.territoryNumber - b.territoryNumber);
    console.log("Foreach1");
    users.forEach(u => {
        var _a;
        if ((_a = u.phoneAssignments) === null || _a === void 0 ? void 0 : _a.length) {
            u.phoneAssignments.forEach(a => {
                var _a;
                (_a = territoriesTableData1.find(x => x.territoryNumber === a)) === null || _a === void 0 ? void 0 : _a.assigned.push(u.email);
            });
        }
    });
    console.log("Foreach2", territoriesTableData1 === null || territoriesTableData1 === void 0 ? void 0 : territoriesTableData1.length);
    return territoriesTableData1;
};
exports.getTelephonicStatisticsTableDataService = getTelephonicStatisticsTableDataService;
const getTerritoryStreetsService = async (territoryNumber) => {
    // without permission filter / used by hth services
    const telephonicTerritory = await telephonicDbConnection.GetTerritory(territoryNumber);
    if (!telephonicTerritory || !telephonicTerritory.households)
        return null;
    const streets = [];
    telephonicTerritory.households.forEach(x => {
        if (!streets.includes(x.street))
            streets.push(x.street);
    });
    return streets;
};
exports.getTerritoryStreetsService = getTerritoryStreetsService;
const getTelephonicTerritoryService = async (requesterUser, territory) => {
    if (!requesterUser || !territory)
        return null;
    if (requesterUser.role !== 1 && !(0, helpers_1.isTerritoryAssignedToUserService)(requesterUser, territory))
        return null;
    const telephonicTerritory = await telephonicDbConnection.GetTerritory(territory);
    if (!telephonicTerritory)
        return null;
    telephonicTerritory.households = (0, helpers_1.filterHouses)(telephonicTerritory.households);
    return telephonicTerritory;
};
exports.getTelephonicTerritoryService = getTelephonicTerritoryService;
const modifyHouseholdService = async (requesterUser, territoryNumber, householdId, callingState, notSubscribed, asignado) => {
    notSubscribed = !!notSubscribed;
    asignado = !!asignado;
    if (!requesterUser || !householdId || !callingState)
        return null;
    const isTelephonicTerritoryAssignedToUser = async (user, territoryNumber, householdId) => {
        if (!territoryNumber || !user || !user.phoneAssignments.length)
            return false;
        const household = await telephonicDbConnection.GetHouseholdById(territoryNumber, householdId);
        if (!household)
            return false;
        try {
            const success = user.phoneAssignments.includes(parseInt(territoryNumber));
            return success;
        }
        catch (error) {
            server_1.logger.Add(`Falló isHouseholdAssignedToUser(): ${error}`, log_services_1.errorLogs);
            return false;
        }
    };
    if (!await isTelephonicTerritoryAssignedToUser(requesterUser, territoryNumber, householdId))
        return null;
    const success = await telephonicDbConnection.UpdateHouseholdState(territoryNumber, householdId, callingState, notSubscribed, asignado);
    if (!success)
        return null;
    const updatedHousehold = await telephonicDbConnection.GetHouseholdById(territoryNumber, householdId);
    if (!updatedHousehold)
        return null;
    server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} modificó una vivienda: territorio ${territoryNumber}, vivienda ${updatedHousehold.householdId}, estado ${updatedHousehold.callingState}, no abonado ${updatedHousehold.notSubscribed}, asignado ${updatedHousehold.isAssigned}`, log_services_1.telephonicLogs);
    //sendAlertOfTerritoriesEmailService()
    return updatedHousehold;
};
exports.modifyHouseholdService = modifyHouseholdService;
const resetTerritoryService = async (requesterUser, territoryNumber, option) => {
    if (!requesterUser || requesterUser.role !== 1 || !territoryNumber || !option)
        return null;
    let modifiedCount = await telephonicDbConnection.ResetTerritory(territoryNumber, option);
    if (modifiedCount === null) {
        server_1.logger.Add(`Admin ${requesterUser.email} no pudo resetear territorio ${territoryNumber} opción ${option}`, log_services_1.telephonicStateLogs);
        return null;
    }
    server_1.logger.Add(`Admin ${requesterUser.email} reseteó territorio ${territoryNumber} con la opción ${option}`, log_services_1.telephonicStateLogs);
    if (modifiedCount) {
        const success = await telephonicDbConnection.SetResetDate(territoryNumber, option);
        if (!success)
            server_1.logger.Add(`Admin ${requesterUser.email} no pudo setear fecha de reseteo de territorio ${territoryNumber} opción ${option}`, log_services_1.errorLogs);
        await (0, exports.changeStateOfTerritoryService)(requesterUser, territoryNumber, false, requesterUser);
    }
    return modifiedCount;
};
exports.resetTerritoryService = resetTerritoryService;
