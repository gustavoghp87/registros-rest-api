"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGraph = exports.authGraph = exports.admin = exports.auth = void 0;
const functions_1 = require("../controllers/functions");
exports.auth = async (req, res, next) => {
    console.log("Entra en auth", req.body);
    try {
        let token = req.body.token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH cookies....", token);
        const user = await functions_1.searchUserByToken(token);
        try {
            console.log("Encontrado usuario por cookie,", user.email);
        }
        catch { }
        if (!user || !user.estado) {
            let userData = { isAuth: false, isAdmin: false };
            return res.status(200).json(userData);
        }
        req.token = token;
        req.user = user;
        next();
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = { isAuth: false, isAdmin: false };
        res.status(200).json(userData);
    }
};
exports.admin = async (req, res, next) => {
    let token = req.body.token.split('newtoken=')[1] || "abcde";
    const user = await functions_1.searchUserByToken(token);
    if (user && user.estado && user.role === 1) {
        req.token = token;
        req.user = user;
        return next();
    }
    console.log("USUARIO NO ENCONTRADO POR TOKEN");
    res.status(200).json({ userData: { isAuth: false, isAdmin: false } });
};
exports.authGraph = async (token) => {
    try {
        let Token = token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH GraphQL....", Token);
        const user = await functions_1.searchUserByToken(Token);
        if (!user.estado)
            return null;
        console.log("Encontrado usuario por cookie,", user.email);
        return user;
    }
    catch (e) {
        console.log("Falló búsqueda por token", token);
    }
};
exports.adminGraph = async (token) => {
    try {
        let Token = token.split('newtoken=')[1] || "abcde";
        console.log("PASANDO POR /AUTH GraphQL....", Token);
        const user = await functions_1.searchUserByToken(Token);
        if (user && user.estado && user.role == 1)
            return user;
        return null;
    }
    catch (e) {
        console.log("Falló búsqueda por token", token);
    }
};
