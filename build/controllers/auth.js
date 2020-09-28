"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../controllers/functions");
;
const auth = async (req, res, next) => {
    let token = req.body.token.split('newtoken=')[1] || "abcde";
    console.log("PASANDO POR /AUTH cookies....", token);
    const user = await functions_1.searchUserByToken(token);
    try {
        console.log("Encontrado usuario por cookie,", user.email);
        req.token = token;
        req.user = user;
        next();
    }
    catch {
        console.log("USUARIO NO ENCONTRADO POR TOKEN");
        let userData = {
            isAuth: false
        };
        res.status(200).json({ userData });
    }
    ;
};
module.exports = { auth };
