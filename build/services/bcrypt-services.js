"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswordsService = exports.generatePasswordHash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const server_1 = require("../server");
const env_variables_1 = require("../env-variables");
const log_services_1 = require("./log-services");
const generatePasswordHash = async (password) => {
    try {
        const passwordHash = await bcrypt_1.default.hash(password, parseInt(env_variables_1.bcryptSalt));
        return passwordHash;
    }
    catch (error) {
        server_1.logger.Add(`Falló generatePasswordHash(): ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.generatePasswordHash = generatePasswordHash;
const comparePasswordsService = async (password, passwordHash) => {
    try {
        const success = await bcrypt_1.default.compare(password, passwordHash);
        return success;
    }
    catch (error) {
        server_1.logger.Add(`Falló comparePasswordsService(): ${error}`, log_services_1.errorLogs);
        return false;
    }
};
exports.comparePasswordsService = comparePasswordsService;
