"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const express_1 = __importDefault(require("express"));
const userServices = __importStar(require("../services/user-services"));
const email_services_1 = require("../services/email-services");
const recaptcha_services_1 = require("../services/recaptcha-services");
// const unauthenticatedUser: typeUser = {
//     isAuth: false,
//     isAdmin: false,
//     role: 0,
//     email: "",
//     estado: false,
//     group: 0
// }
const blindUser = (user) => {
    if (!user)
        return user;
    user.password = undefined;
    user.tokenId = 0;
    user.recoveryOptions = [];
    return user;
};
exports.userController = express_1.default.Router()
    // get my user
    .get('/', async (req, res) => {
    if (!req.user)
        return res.json({ success: false });
    let user = blindUser(req.user);
    res.json({ success: true, user });
})
    // sign up user
    .post('/', async (req, res) => {
    const { email, password, group, recaptchaToken } = req.body;
    const checkRecaptch = await (0, recaptcha_services_1.checkRecaptchaTokenService)(recaptchaToken);
    if (!checkRecaptch)
        return res.json({ success: false, recaptchaFails: true });
    const user = await userServices.getUserByEmailService(email);
    if (user)
        return res.json({ success: false, userExists: true });
    const success = await userServices.registerUserService(email, password, group);
    res.json({ success });
})
    // change features for other users
    .put('/', async (req, res) => {
    const email = req.body.email;
    const isActive = req.body.isActive;
    const role = req.body.role;
    const group = req.body.group;
    let user = await userServices.editUserService(req.user, email, isActive, role, group);
    if (!user)
        return res.json({ success: false });
    user = blindUser(user);
    res.json({ success: true, user });
})
    // recover account by a link in email box
    .patch('/', async (req, res) => {
    const email = req.body.email || "";
    const response = await userServices.recoverAccountService(email);
    if (response === "no user")
        res.json({ success: false, noUser: true });
    else if (response === "not sent")
        res.json({ success: false, notSent: true });
    else if (response === "ok")
        res.json({ success: true });
    else
        res.json({ success: false });
})
    // detele user
    .delete('/', async (req, res) => {
    const userId = req.body.userId;
    const success = await userServices.deleteUserService(req.user, userId);
    res.json({ success });
})
    // get all users
    .get('/all', async (req, res) => {
    const users = await userServices.getUsersService(req.user);
    if (!users)
        return res.json({ success: false });
    users.forEach((user) => { user = blindUser(user); });
    res.json({ success: true, users });
})
    // change house-to-house assignations for other users
    .put('/hth-assignment', async (req, res) => {
    const email = req.body.email;
    const toAssign = req.body.toAssign;
    const toUnassign = req.body.toUnassign;
    const all = req.body.all;
    let user = await userServices.assignHTHTerritoryService(req.user, email, toAssign, toUnassign, all);
    if (!user)
        return res.json({ success: false });
    user = blindUser(user);
    res.json({ success: true, user });
})
    // change telephonic assignations for other users
    .put('/tlp-assignment', async (req, res) => {
    const email = req.body.email;
    const toAssign = req.body.toAssign;
    const toUnassign = req.body.toUnassign;
    const all = req.body.all;
    let user = await userServices.assignTLPTerritoryService(req.user, email, toAssign, toUnassign, all);
    if (!user)
        return res.json({ success: false });
    user = blindUser(user);
    res.json({ success: true, user });
})
    // get email from email link id
    .get('/recovery/:id', async (req, res) => {
    const id = req.params.id;
    const user = await userServices.getUserByEmailLinkService(id);
    if (!user || !user.email)
        return res.json({ success: false });
    res.json({ success: true, email: user.email });
})
    // new login
    .post('/token', async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    const newToken = await userServices.loginUserService(email, password, recaptchaToken);
    if (!newToken)
        return res.json({ success: false });
    if (newToken === 'recaptchaFailed')
        return res.json({ success: false, recaptchaFails: true });
    if (newToken === 'isDisabled')
        return res.json({ success: false, isDisabled: true });
    res.json({ success: true, newToken });
})
    // logout all devices
    .delete('/token', async (req, res) => {
    const newToken = await userServices.logoutAllService(req.user);
    res.json({ success: !!newToken, newToken });
})
    // change my password
    .put('/token', async (req, res) => {
    const { psw, newPsw, id } = req.body;
    if (psw && newPsw) {
        // change my psw
        const newToken = await userServices.changePswService(req.user, psw, newPsw);
        if (newToken === "wrongPassword")
            return res.json({ success: false, wrongPassword: true });
        res.json({ success: !!newToken, newToken });
    }
    else if (id && newPsw) {
        // change my psw by recovery option
        const newToken = await userServices.changePswByEmailLinkService(id, newPsw);
        if (!newToken)
            return res.json({ success: false });
        if (newToken === "expired")
            return res.json({ success: false, expired: true });
        if (newToken === "used")
            return res.json({ success: false, used: true });
        res.json({ success: true, newToken });
    }
    else {
        res.json({ success: false });
    }
})
    // change the password of other user by admin
    .patch('/token', async (req, res) => {
    const email = req.body.email;
    const newPassword = await userServices.changePswOtherUserService(req.user, email);
    if (!newPassword)
        return res.json({ success: false });
    const emailSuccess = await (0, email_services_1.sendNewPswEmailService)(email, newPassword);
    res.json({ success: !!newPassword, newPassword, emailSuccess });
});
