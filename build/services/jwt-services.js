"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUserService = exports.decodeService = exports.decodeVerifiedService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_variables_1 = require("../env-variables");
const server_1 = require("../server");
const log_services_1 = require("./log-services");
const user_services_1 = require("./user-services");
const decodeVerifiedService = (token) => {
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_variables_1.jwtString);
        return decoded;
    }
    catch (error) {
        const decoded = (0, exports.decodeService)(token);
        if (decoded && decoded.payload.userId) {
            (0, user_services_1.getUserById)(decoded.payload.userId).then((user) => {
                if (user)
                    server_1.logger.Add(`No se pudo verificar token de ${user.email}: ${error}`, log_services_1.errorLogs);
                else
                    server_1.logger.Add(`No se pudo verificar token de usuario desconocido: ${error}`, log_services_1.errorLogs);
            });
        }
        else if (decoded)
            server_1.logger.Add(`No se pudo verificar token ${JSON.stringify(decoded)}: ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.decodeVerifiedService = decodeVerifiedService;
const decodeService = (token) => {
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.decode(token, { complete: true, json: true });
        return decoded;
    }
    catch (error) {
        server_1.logger.Add(`No se pudo decodificar token: ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.decodeService = decodeService;
const signUserService = (id, tokenId) => {
    try {
        const token = jsonwebtoken_1.default.sign({ userId: id, tokenId }, env_variables_1.jwtString, { expiresIn: server_1.accessTokensExpiresIn });
        return token;
    }
    catch (error) {
        server_1.logger.Add(`No se pudo crear token de usuario: ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.signUserService = signUserService;
