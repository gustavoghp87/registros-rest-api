"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpUser = void 0;
const user_services_1 = require("./user-services");
const mocked_user_service_1 = require("./mocked-user-service");
const models_1 = require("../models");
const setUpUser = async (req, res, next) => {
    var _a;
    const token = req.header(models_1.authorizationString) || "";
    if (token || ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.email)) {
        const mockedUserResponse = (0, mocked_user_service_1.getMockedUserResponse)(token, req.body.email);
        if (mockedUserResponse)
            return res.json(mockedUserResponse);
    }
    if (token) {
        const user = await (0, user_services_1.getActivatedUserByAccessTokenService)(token);
        if (user)
            req.user = user;
    }
    const recaptchaToken = req.header(models_1.recaptchaTokenString) || "";
    if (recaptchaToken) {
        // const success: boolean = await userServices.checkRecaptchaTokenService(recaptchaToken)    TODO
        // if (!success) return res.json({ success })
    }
    next();
};
exports.setUpUser = setUpUser;
