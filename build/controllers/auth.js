"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.auth = void 0;
const functions_1 = require("../controllers/functions");
exports.auth = async (req, res, next) => {
    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH cookies....", token);
        const user = await functions_1.searchUserByToken(token);
        console.log("Encontrado usuario por cookie,", user.email);
        req.token = token;
        req.user = user;
        next();
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false,
            isAdmin: false
        };
        res.status(200).json(userData);
    }
};
exports.admin = async (req, res, next) => {
    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH cookies....", token);
        const user = await functions_1.searchUserByToken(token);
        console.log("Encontrado usuario por cookie,", user.email);
        if (user.role === 1) {
            req.token = token;
            req.user = user;
            next();
        }
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false,
            isAdmin: false
        };
        res.status(200).json(userData);
    }
};
