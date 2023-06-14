"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDb = void 0;
const server_1 = require("../server");
const log_services_1 = require("../services/log-services");
const getCollection = () => server_1.dbClient.Client.db(server_1.dbClient.DbMW).collection(server_1.dbClient.CollUsers);
class UserDb {
    async AddRecoveryOption(email, id) {
        try {
            const user = await this.GetUserByEmail(email);
            if (!user)
                return false;
            const newRecoveryOption = {
                id,
                expiration: +new Date() + 24 * 60 * 60 * 1000,
                used: false
            };
            let recoveryOptions = user.recoveryOptions;
            if (!recoveryOptions)
                recoveryOptions = [];
            recoveryOptions.push(newRecoveryOption);
            const result = await getCollection().updateOne({ email }, {
                $set: { recoveryOptions }
            });
            return !!result && !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AddRecoveryOption() ${email} ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async AssignCampaignPack(email, id) {
        try {
            const result = await getCollection().updateOne({ email }, { $addToSet: { campaignAssignments: id } });
            return !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló AssignCampaignPack() ${email} ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async AssignHTHTerritory(email, toAssign, toUnassign, all) {
        try {
            let result;
            if (all)
                result = await getCollection().updateOne({ email }, { $set: { hthAssignments: [] } });
            else if (toAssign)
                result = await getCollection().updateOne({ email }, { $addToSet: { hthAssignments: toAssign } });
            else if (toUnassign)
                result = await getCollection().updateOne({ email }, { $pull: { hthAssignments: toUnassign } });
            else
                return null;
            if (!result || !result.modifiedCount)
                return null;
            const user = await this.GetUserByEmail(email);
            return user !== null && user !== void 0 ? user : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló AssignTerritory() ${email} ${toAssign} ${toUnassign} ${all}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async AssignTLPTerritory(email, toAssign, toUnassign, all) {
        try {
            if (all)
                await getCollection().updateOne({ email }, { $set: { phoneAssignments: [] } });
            else if (toAssign)
                await getCollection().updateOne({ email }, { $addToSet: { phoneAssignments: toAssign } });
            else if (toUnassign)
                await getCollection().updateOne({ email }, { $pull: { phoneAssignments: toUnassign } });
            const user = await this.GetUserByEmail(email);
            return user !== null && user !== void 0 ? user : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló AssignTerritory() ${email} ${toAssign} ${toUnassign} ${all}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async ChangePsw(email, encryptedPassword) {
        try {
            const result = await getCollection().updateOne({ email }, { $set: { password: encryptedPassword } });
            return !!result && !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló ChangePsw() ${email}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async DeleteUser(id) {
        try {
            if (!id)
                return false;
            const result = await getCollection().deleteOne({ id });
            return !!result.deletedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló DeleteUser() ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async EditUserState(email, isActive, role, group) {
        try {
            const result = await getCollection().updateOne({ email }, { $set: { isActive, role, group } });
            if (!result.modifiedCount)
                return null;
            const user = await this.GetUserByEmail(email);
            return user && user.isActive === isActive && user.role === role && user.group === group ? user : null;
        }
        catch (error) {
            server_1.logger.Add(`Falló UpdateUserState() ${email} ${isActive} ${role} ${group}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetAllUsers() {
        try {
            const users = await getCollection().find().toArray();
            return users;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetAllUsers(): ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetUserByEmail(email) {
        try {
            const user = await getCollection().findOne({ email });
            if (!user)
                return null;
            return user;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetUserByEmail() ${email}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async GetUserById(id) {
        try {
            const user = await getCollection().findOne({ id });
            return user;
        }
        catch (error) {
            server_1.logger.Add(`Falló GetUserById() ${id}: ${error}`, log_services_1.errorLogs);
            return null;
        }
    }
    async RegisterUser(newUser) {
        try {
            await getCollection().insertOne(newUser);
            const user = await this.GetUserByEmail(newUser.email);
            return !!user;
        }
        catch (error) {
            server_1.logger.Add(`Falló RegisterUser() ${JSON.stringify(newUser)}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async SetRecoveryOptionAsUsed(email, id) {
        try {
            if (!email || !id)
                throw new Error("Faltan datos");
            const result = await getCollection().updateOne({ email }, { $set: { 'recoveryOptions.$[x].used': true } }, { arrayFilters: [{ 'x.id': id }] });
            return !!result && !!result.modifiedCount;
        }
        catch (error) {
            server_1.logger.Add(`Falló SetRecoveryOptionAsUsed() ${email} ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
    async UpdateTokenId(id, tokenId) {
        try {
            await getCollection().updateOne({ id }, { $set: { tokenId } });
            const user = await this.GetUserById(id);
            return !!user && user.tokenId === tokenId;
        }
        catch (error) {
            server_1.logger.Add(`Falló UpdateTokenId() ${id}: ${error}`, log_services_1.errorLogs);
            return false;
        }
    }
}
exports.UserDb = UserDb;
