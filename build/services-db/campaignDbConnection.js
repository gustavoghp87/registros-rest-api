"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const models_1 = require("../models");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollCampaigns);
class CampaignDb {
    constructor() {
        this.noAsignado = "No asignado";
    }
    async AskForANewCampaignPack(email) {
        try {
            await getCollection().updateOne({ $and: [
                    { $or: [{ isFinished: null }, { isFinished: false }] },
                    { $or: [{ assignedTo: null }, { assignedTo: "" }, { assignedTo: this.noAsignado }] }
                ] }, { $set: { assignedTo: email }
            });
            const pack = await getCollection().findOne({ assignedTo: email });
            return pack === null || pack === void 0 ? void 0 : pack.id;
        }
        catch (error) {
            server_1.logger.Add(`Falló AskForANewCampaignPack() ${email}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async AssignCampaignPackByEmail(id, email) {
        try {
            let result;
            if (email === models_1.nadie)
                result = await getCollection().updateOne({ id }, { $set: { assignedTo: this.noAsignado } });
            else
                result = await getCollection().updateOne({ id }, { $set: { assignedTo: email } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AssignCampaignPackByEmail() ${id} ${email}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async ChangeAccesibilityMode(id, isAccessible) {
        try {
            const result = await getCollection().updateOne({ id }, { $set: { isAccessible } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló ChangeAccesibilityMode() ${id} ${isAccessible}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async CloseCampaignPack(id) {
        try {
            const result = await getCollection().updateOne({ id }, { $set: { assignedTo: this.noAsignado, isFinished: true } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló CloseCampaignPack() id ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditCampaignPackById(id, phoneNumber, checked) {
        try {
            let result;
            if (checked) {
                result = await getCollection().updateOne({ id }, { $addToSet: { calledPhones: phoneNumber } });
            }
            else {
                result = await getCollection().updateOne({ id }, { $pull: { calledPhones: phoneNumber } });
                await getCollection().updateOne({ id }, { $set: { isFinished: false } });
            }
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló EditCampaignPackById() ${id} ${phoneNumber} ${checked}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async GetCampaignPackById(id) {
        if (!id)
            return null;
        try {
            const pack = await getCollection().findOne({ id });
            return pack !== null && pack !== void 0 ? pack : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetCampaignPackById() id ${id}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetCampaignPacks() {
        try {
            const packs = await getCollection().find().toArray();
            return packs !== null && packs !== void 0 ? packs : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetCampaignPacks(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetCampaignPacksByUser(userEmail) {
        if (!userEmail)
            return null;
        try {
            const packs = await getCollection().find({ assignedTo: userEmail }).toArray();
            return packs !== null && packs !== void 0 ? packs : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetCampaignPacksByUser() usuario ${userEmail}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
}
exports.CampaignDb = CampaignDb;
