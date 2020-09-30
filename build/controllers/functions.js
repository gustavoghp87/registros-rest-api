"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBuildingsByNumber = exports.addTokenToUser = exports.searchAllUsers = exports.searchUserByToken = exports.searchUserByEmail = void 0;
const database_1 = require("./database");
exports.searchUserByEmail = async (email) => {
    const user = await database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ email });
    return user;
};
exports.searchUserByToken = async (newtoken) => {
    const user = await database_1.client.db("Misericordia-Web").collection('usuarios').findOne({ newtoken });
    return user;
};
exports.searchAllUsers = async () => {
    const users = await database_1.client.db("Misericordia-Web").collection('usuarios').find().toArray();
    return users;
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
exports.searchBuildingsByNumber = async (num) => {
    const terr = await database_1.client.db("Misericordia-Web").collection('viviendas').find({ territorio: num }).toArray();
    return terr;
};
