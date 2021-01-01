"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asignCampaign = exports.getCampaign = exports.resetTerritory = exports.searchBuildingByNumber = exports.searchTerritoryByNumber = exports.countBlocks = exports.changeMode = exports.checkRecaptchaToken = exports.registerUser = exports.addTokenToUser = exports.searchAllUsers = exports.searchUserByToken = exports.searchUserById = exports.searchUserByEmail = void 0;
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
    const user = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).findOne({ _id: new mongodb_1.ObjectId(_id) });
    return user;
};
exports.searchUserByToken = async (newtoken) => {
    console.log("Buscando por token");
    const user = await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).findOne({ newtoken });
    return user;
};
exports.searchAllUsers = async () => {
    console.log("Buscando a todos los usuarios");
    const users = (await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).find().toArray()).reverse();
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
        console.log("Creado nuevo usuario", newUser);
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
exports.changeMode = async (email, darkMode) => {
    try {
        await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ email }, { $set: { darkMode } });
        console.log("Modo oscuro cambiado de", !darkMode, "a", darkMode, "(" + email + ")");
        return true;
    }
    catch (error) {
        console.log("Error al intentar cambiar modo oscuro...", error);
        return false;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////
exports.countBlocks = async (terr) => {
    const buscar = ['1', '2', '3', '4', '5', '6', '7', '8'];
    let manzanas = [];
    let cantidad = 1;
    while (cantidad < buscar.length) {
        let busq = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).findOne({
            territorio: { $in: [terr] },
            manzana: { $in: [cantidad.toString()] }
        });
        if (busq)
            manzanas.push(cantidad);
        cantidad++;
    }
    console.log("Array de manzanas:", manzanas);
    //return manzanas[manzanas.length-1].toString()       // manzana mayor
    return manzanas;
};
exports.searchTerritoryByNumber = async (terr, manzana, todo, traidos, traerTodos) => {
    console.log("Buscando viviendas por territorio", terr, "manzana", manzana);
    let viviendas;
    if (!todo && !traerTodos)
        viviendas = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({
            $and: [
                { territorio: { $in: [terr] } },
                { manzana: { $in: [manzana] } },
                { estado: 'No predicado' },
                { $or: [{ noAbonado: false }, { noAbonado: null }] }
            ]
        }).toArray(); // quito limit
    if (!todo && traerTodos)
        viviendas = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({
            $and: [
                { territorio: { $in: [terr] } },
                { manzana: { $in: [manzana] } },
                { estado: 'No predicado' },
                { $or: [{ noAbonado: false }, { noAbonado: null }] }
            ]
        }).toArray();
    if (todo) {
        if (traerTodos)
            viviendas = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ territorio: { $in: [terr] }, manzana: { $in: [manzana] } }).sort({ fechaUlt: 1 }).toArray();
        else
            viviendas = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ territorio: { $in: [terr] }, manzana: { $in: [manzana] } }).limit(traidos).toArray();
    }
    return viviendas;
};
exports.searchBuildingByNumber = async (num) => {
    console.log("Buscando vivienda por inner_id", num);
    const vivienda = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).findOne({ inner_id: num });
    console.log(vivienda);
    return vivienda;
};
///////////////////////////////////////////////////////////////////////////////////////////////////
exports.resetTerritory = async (token, option, territorio) => {
    token = token.split('newtoken=')[1] || "abcde";
    const user = await exports.searchUserByToken(token);
    if (!user || user.role !== 1) {
        console.log("No autenticado por token");
        return false;
    }
    console.log("Pasó auth ############");
    const time = Date.now(); // todo en milisegundos
    const sixMonths = 15778458000;
    const timeSixMonths = time - sixMonths;
    if (option === 1) {
        console.log("Entra en opción 1"); // limpiar más de 6 meses
        await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateMany({
            $and: [
                { territorio },
                { $or: [{ noAbonado: false }, { noAbonado: null }] },
                { fechaUlt: { $lt: timeSixMonths } }
            ]
        }, {
            $set: { estado: "No predicado" }
        }, {
            multi: true
        });
        return true;
    }
    if (option === 2) {
        console.log("Entra en opción 2"); // limpiar todos
        await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateMany({
            $and: [
                { territorio },
                { $or: [{ noAbonado: false }, { noAbonado: null }] }
            ]
        }, {
            $set: { estado: "No predicado" }
        }, {
            multi: true
        });
        return true;
    }
    if (option === 3) {
        console.log("Entra en opción 3"); // limpiar y no abonados de más de 6 meses
        await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateMany({
            $and: [
                { territorio },
                { fechaUlt: { $lt: timeSixMonths } }
            ]
        }, {
            $set: { estado: "No predicado", noAbonado: false }
        }, {
            multi: true
        });
        return true;
    }
    if (option === 4) {
        console.log("Entra en opción 4"); // limpiar absolutamente todo
        await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateMany({
            $and: [
                { territorio }
            ]
        }, {
            $set: { estado: "No predicado", noAbonado: false }
        }, {
            multi: true
        });
        return true;
    }
    return false;
};
exports.getCampaign = async (token) => {
    token = token.split('newtoken=')[1] || "abcde";
    const user = await exports.searchUserByToken(token);
    if (!user || user.role !== 1) {
        console.log("No autenticado por token");
        return false;
    }
    console.log("Pasó auth ############ mandando campanya 2021");
    try {
        const pack = await database_1.client.db(database_1.dbMW).collection('campanya').find().toArray();
        return pack;
    }
    catch (error) {
        console.error(error);
    }
};
exports.asignCampaign = async (token, id, email) => {
    token = token.split('newtoken=')[1] || "abcde";
    const user = await exports.searchUserByToken(token);
    if (!user || user.role !== 1) {
        console.log("No autenticado por token");
        return false;
    }
    console.log("Pasó auth ############ asignando usuario a campanya 2021");
    try {
        if (email === 'Nadie')
            await database_1.client.db(database_1.dbMW).collection('campanya').updateOne({ id }, { $set: { asignado: 'No asignado' } });
        else
            await database_1.client.db(database_1.dbMW).collection('campanya').updateOne({ id }, { $set: { asignado: email } });
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
