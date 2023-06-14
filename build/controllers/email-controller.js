"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailController = void 0;
const express_1 = __importDefault(require("express"));
const email_services_1 = require("../services/email-services");
exports.emailController = express_1.default.Router()
    // step 1
    .get('/', async (req, res) => {
    const url = await (0, email_services_1.getGmailUrlService)(req.user);
    res.json({ success: !!url, url });
})
    // step 2
    .post('/', async (req, res) => {
    const code = req.body.code;
    const gmailKeys = await (0, email_services_1.getGmailRequestService)(req.user, code);
    res.json({ success: !!gmailKeys, gmailKeys });
})
    // save new Gmail API token
    .put('/', async (req, res) => {
    const accessToken = req.body.accessToken;
    const refreshToken = req.body.refreshToken;
    const success = await (0, email_services_1.saveNewGmailAPITokenToDBService)(req.user, accessToken, refreshToken);
    res.json({ success });
});
