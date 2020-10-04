"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGraph = exports.authGraph = exports.admin = exports.auth = void 0;
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
exports.authGraph = async (token) => {
    try {
        const Token = token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH GraphQL....", Token);
        const user = await functions_1.searchUserByToken(Token);
        console.log("Encontrado usuario por cookie,", user.email);
        return user;
    }
    catch (e) {
        console.log("Falló búsqueda por token", token);
    }
};
exports.adminGraph = async (token) => {
    try {
        const Token = token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH GraphQL....", Token);
        const user = await functions_1.searchUserByToken(Token);
        if (user && user.role === 1)
            return user;
        return null;
    }
    catch (e) {
        console.log("Falló búsqueda por token", token);
    }
};
