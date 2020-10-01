"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBuildingsByNumber = exports.checkRecaptchaToken = exports.registerUser = exports.addTokenToUser = exports.searchAllUsers = exports.searchUserByToken = exports.searchUserByEmail = void 0;
const database_1 = require("./database");
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
exports.registerUser = async (email, password, group) => {
    const passwordEncrypted = await bcrypt_1.default.hash(password, 12);
    const newUser = {
        role: 0,
        estado: "desactivado",
        actividad: [],
        email,
        password: passwordEncrypted,
        group,
        isAuth: false,
        isAdmin: false
    };
    try {
        await database_1.client.db("Misericordia-Web").collection('usuarios').insertOne(newUser);
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
exports.searchBuildingsByNumber = async (num) => {
    const terr = await database_1.client.db("Misericordia-Web").collection('viviendas')
        .find({ territorio: num }).toArray();
    return terr;
};
