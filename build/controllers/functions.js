"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBuildingByNumber = exports.searchTerritoryByNumber = exports.countBlocks = exports.checkRecaptchaToken = exports.registerUser = exports.addTokenToUser = exports.searchAllUsers = exports.searchUserByToken = exports.searchUserById = exports.searchUserByEmail = void 0;
const database_1 = require("./database");
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongodb_1 = require("mongodb");
exports.searchUserByEmail = async (email) => {
    const user = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).findOne({ email });
    return user;
};
exports.searchUserById = async (_id) => {
    console.log("buscando por id,", _id);
    const user = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers)
        .findOne({ _id: new mongodb_1.ObjectId(_id) });
    return user;
};
exports.searchUserByToken = async (newtoken) => {
    console.log("Buscando por token");
    const user = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).findOne({ newtoken });
    return user;
};
exports.searchAllUsers = async () => {
    console.log("Buscando a todos los usuarios");
    const users = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).find().toArray();
    return users;
};
exports.addTokenToUser = async (email, token) => {
    try {
        await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ email }, { $set: { newtoken: token } });
        console.log("Token agregado a db correctamente", token);
        return true;
    }
    catch (error) {
        console.log("Error al intentar agregar token a db...", error);
        return false;
    }
};
exports.registerUser = async (email, password, group) => {
    const passwordEncrypted = await bcrypt_1.default.hash(password, 12);
    const newUser = {
        role: 0,
        estado: false,
        email,
        password: passwordEncrypted,
        group
    };
    try {
        await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).insertOne(newUser);
        console.log(newUser);
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
};
exports.checkRecaptchaToken = async (token) => {
    const privateKey = process.env.RECAPTCHA_SECRET || "";
    const publicKey = token;
    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const verifyURL = `${url}?secret=${privateKey}&response=${publicKey}`;
    const axios = await axios_1.default.post(verifyURL);
    const { success } = axios.data;
    console.log("Recaptcha:", success);
    return success;
};
////////////////////////////////////////////////////////////////////////////////////////////////
exports.countBlocks = async (terr) => {
    let cantidad = 0, cond = true;
    do {
        cantidad = cantidad + 1;
        console.log("Territorio", terr, "cantidad al entrar al ciclo", cantidad);
        let busq = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).findOne({
            territorio: { $in: [terr] },
            manzana: { $in: [cantidad.toString()] }
        });
        if (!busq) {
            cantidad = cantidad - 1;
            cond = false;
        }
    } while (cond === true);
    console.log("Cantidad de salida", cantidad);
    return cantidad;
};
exports.searchTerritoryByNumber = async (terr, manzana) => {
    console.log("Buscando viviendas por territorio", terr, "manzana", manzana);
    const viviendas = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({
        territorio: { $in: [terr] },
        manzana: { $in: [manzana] }
    }).limit(10).toArray();
    return viviendas;
};
exports.searchBuildingByNumber = async (num) => {
    console.log("Buscando vivienda por inner_id", num);
    const vivienda = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr)
        .findOne({ inner_id: num });
    console.log(vivienda);
    return vivienda;
};
