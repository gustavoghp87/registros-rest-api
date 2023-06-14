"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logController = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
exports.logController = express_1.default.Router()
    // get all logs
    .get('/', async (req, res) => {
    const allLogsObj = await server_1.logger.GetAll(req.user);
    res.json({ success: !!allLogsObj, allLogsObj });
});
