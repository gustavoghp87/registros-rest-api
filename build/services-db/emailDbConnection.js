"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollEmails);
class EmailDb {
    async GetEmailLastTime() {
        try {
            const lastEmailObj = await getCollection().findOne();
            if (!lastEmailObj)
                throw new Error("No se pudo leer documento");
            if (!lastEmailObj.lastEmailDate)
                throw new Error("No está la fecha");
            return lastEmailObj.lastEmailDate;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetEmailLastTime(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetEmailObject() {
        try {
            const lastEmailObj = await getCollection().findOne();
            if (!lastEmailObj)
                throw new Error("No se pudo leer documento");
            return lastEmailObj;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetEmailObject(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetGmailTokens() {
        try {
            const lastEmailObj = await getCollection().findOne();
            if (!lastEmailObj)
                throw new Error("No se pudo leer documento");
            return {
                access_token: lastEmailObj.accessToken,
                expiry_date: 0,
                id_token: '',
                refresh_token: lastEmailObj.refreshToken,
                scope: '',
                token_type: ''
            };
        }
        catch (error) {
            server_1.logger.Add(`Falló GetGmailTokens(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async UpdateLastEmail() {
        try {
            const newDate = +new Date();
            const result = await getCollection().updateOne({}, { $set: { lastEmail: newDate } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló UpdateLastEmail(): ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async SaveNewGmailAPITokensToDB(accessToken, refreshToken) {
        const CreateDocument = async () => {
            try {
                const result = await getCollection().insertOne({
                    accessToken, refreshToken
                });
                return !!result && !!result.insertedId;
            }
            catch (error) {
                server_1.logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, log_services_1.errorLogs);
                return false;
            }
        };
        try {
            if (!accessToken || !refreshToken)
                throw new Error("No llegaron los tokens");
            const tokens = await getCollection().findOne();
            if (!tokens) {
                const success = await CreateDocument();
                if (!success)
                    throw new Error("No se pudo crear documento");
            }
            const result = await getCollection().updateOne({}, { $set: { accessToken, refreshToken } });
            if (!result || !result.modifiedCount) {
                throw new Error("No encontró valor a modificar");
            }
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló SaveNewGmailAPITokensToDB(): ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
}
exports.EmailDb = EmailDb;
