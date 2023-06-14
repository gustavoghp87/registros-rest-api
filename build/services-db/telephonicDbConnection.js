"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonicDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollTelephonicTerritories);
class TelephonicDb {
    constructor() {
        this.noPredicado = 'No predicado';
    }
    async ChangeStateOfTerritory(territoryNumber, isFinished) {
        try {
            if (!territoryNumber)
                throw new Error("No llegó el territorio");
            const result = await getCollection().updateOne({ territoryNumber }, { $set: { 'stateOfTerritory.isFinished': isFinished } });
            return !!result && !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló ChangeStateOfTerritory() pasando ${territoryNumber} a ${isFinished}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async GetAllTelephonicTerritories() {
        try {
            const phoneTerritories = await getCollection().find().toArray();
            return phoneTerritories;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetAllHouseholds(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetHouseholdById(territoryNumber, householdId) {
        try {
            const telephonicTerritory = await getCollection().findOne({ territoryNumber });
            return telephonicTerritory.households.find(x => x.householdId === householdId) || null; // ...
        }
        catch (error) {
            server_1.logger.Add(`Falló GetHouseholdById(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetTerritory(territoryNumber) {
        try {
            const telephonicTerritory = await getCollection().findOne({ territoryNumber });
            return telephonicTerritory;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetTerritory() territorio ${territoryNumber}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async ResetTerritory(territoryNumber, option) {
        const sixMonthsInMilliseconds = Date.now() - 15778458000;
        try {
            let result;
            if (option === 1) {
                console.log("Option 1 // clean all except 'notSubscribed', more than 6 months");
                result = await getCollection().updateOne({ territoryNumber }, { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } }, { arrayFilters: [{ 'x.notSubscribed': false, 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] });
            }
            else if (option === 2) {
                console.log("Option 2  // clean all except 'notSubscribed'");
                result = await getCollection().updateOne({ territoryNumber }, { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } }, { arrayFilters: [{ 'x.notSubscribed': false }] });
            }
            else if (option === 3) {
                console.log("Option 3  // clean more than 6 months even 'notSubscribed'");
                result = await getCollection().updateOne({ territoryNumber }, { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false, 'households.$[x].notSubscribed': false } }, { arrayFilters: [{ 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] });
            }
            else if (option === 4) {
                console.log("Option 4  // clean all even 'notSubscribed'");
                result = await getCollection().updateOne({ territoryNumber }, { $set: { 'households.$[].callingState': this.noPredicado, 'households.$[].isAssigned': false, 'households.$[].notSubscribed': false } });
            }
            else {
                result = null;
            }
            return result ? result.modifiedCount : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló ResetTerritory() territorio ${territoryNumber} opción ${option}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async SetResetDate(territoryNumber, option) {
        try {
            const result = await getCollection().updateOne({ territoryNumber }, { $push: { 'stateOfTerritory.resetDates': { date: +new Date(), option } } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló SetResetDate() pasando ${territoryNumber} opción ${option}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async UpdateHouseholdState(territoryNumber, householdId, callingState, notSubscribed, isAssigned) {
        try {
            const result = await getCollection().updateOne({ territoryNumber }, { $set: {
                    'households.$[x].callingState': callingState,
                    'households.$[x].notSubscribed': notSubscribed,
                    'households.$[x].isAssigned': isAssigned,
                    'households.$[x].dateOfLastCall': Date.now()
                } }, { arrayFilters: [{ 'x.householdId': householdId }] });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló UpdateHouseholdState() pasando ${householdId} ${callingState} ${notSubscribed} ${isAssigned}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
}
exports.TelephonicDb = TelephonicDb;
