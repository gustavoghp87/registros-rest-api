"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.congregationController = void 0;
const express_1 = __importDefault(require("express"));
const congregation_services_1 = require("../services/congregation-services");
exports.congregationController = express_1.default.Router()
    // get congregation items
    .get('/', async (req, res) => {
    const congregationItems = await (0, congregation_services_1.getCongregationItems)(req.user);
    return res.json({ success: !!congregationItems, congregationItems });
});
