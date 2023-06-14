"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRecaptchaTokenService = void 0;
const axios_1 = __importDefault(require("axios"));
const server_1 = require("../server");
const env_variables_1 = require("../env-variables");
const log_services_1 = require("./log-services");
const checkRecaptchaTokenService = async (recaptchaToken) => {
    if (!recaptchaToken || !env_variables_1.privateKey)
        return false;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${env_variables_1.privateKey}&response=${recaptchaToken}`;
    try {
        const { data } = await axios_1.default.post(verifyURL);
        return !!(data === null || data === void 0 ? void 0 : data.success);
    }
    catch (error) {
        server_1.logger.Add(`Falló checkRecaptchaTokenService(): ${error}`, log_services_1.errorLogs);
        return false;
    }
};
exports.checkRecaptchaTokenService = checkRecaptchaTokenService;
