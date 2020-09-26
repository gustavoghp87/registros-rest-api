"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTokenToUser = exports.searchUserByToken = exports.searchUserByEmail = void 0;
const database_1 = require("./database");
exports.searchUserByEmail = async (email) => {
    const User = await database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ email });
    return User;
};
exports.searchUserByToken = async (newtoken) => {
    const User = await database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ newtoken });
    return User;
};
exports.addTokenToUser = async (email, token) => {
    try {
        await database_1.client.db("Misericordia-Web").collection('usuarios').updateOne({ email }, { $set: { newtoken: token } });
        console.log("Token agregado a db correctamente", token);
        return true;
    }
    catch (error) {
        console.log("Error al intentar agregar token a db...", error);
        return false;
    }
};
