"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("../controllers/functions"));
const auth_1 = require("../controllers/auth");
const database_1 = require("../controllers/database");
module.exports = {
    countBlocks: async (root, args) => {
        console.log("Buscando cantidad de manzanas");
        try {
            const cantidad = (await functions.countBlocks(args.terr)).toString();
            return { cantidad };
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },
    getApartmentsByTerritory: async (root, args) => {
        const user = await auth_1.authGraph(args.token);
        if (!user)
            return null;
        console.log("buscando", args.terr, args.manzana, args.todo, args.traidos, args.traerTodos);
        const viviendas = await functions.searchTerritoryByNumber(args.terr, args.manzana, args.todo, args.traidos, args.traerTodos);
        return viviendas;
    },
    getApartment: async (root, args) => {
        const user = await auth_1.authGraph(args.token);
        if (!user)
            return null;
        const vivienda = await functions.searchBuildingByNumber(args.inner_id);
        return vivienda;
    },
    getUsers: async (root, args) => {
        try {
            console.log("Buscando todos los usuarios");
            const user = await auth_1.adminGraph(args.token);
            if (!user)
                return null;
            const users = await functions.searchAllUsers();
            return users;
        }
        catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`);
            return `Error desactivando usuario`;
        }
    },
    getGlobalStatistics: async (root, args) => {
        const userAuth = await auth_1.adminGraph(args.token);
        if (!userAuth)
            return null;
        const count = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find().count();
        const countContesto = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ estado: 'Contestó' }).count();
        const countNoContesto = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ estado: 'No contestó' }).count();
        const countDejarCarta = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ estado: 'A dejar carta' }).count();
        const countNoLlamar = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ estado: 'No llamar' }).count();
        const countNoAbonado = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ noAbonado: true }).count();
        console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar);
        return {
            count,
            countContesto,
            countNoContesto,
            countDejarCarta,
            countNoLlamar,
            countNoAbonado
        };
    },
    getLocalStatistics: async (root, args) => {
        const userAuth = await auth_1.adminGraph(args.token);
        if (!userAuth)
            return null;
        const count = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ territorio: args.territorio }).count();
        const countContesto = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ $and: [{ territorio: args.territorio }, { estado: 'Contestó' }] }).count();
        const countNoContesto = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ $and: [{ territorio: args.territorio }, { estado: 'No contestó' }] }).count();
        const countDejarCarta = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ $and: [{ territorio: args.territorio }, { estado: 'A dejar carta' }] }).count();
        const countNoLlamar = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ $and: [{ territorio: args.territorio }, { estado: 'No llamar' }] }).count();
        const countNoAbonado = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({ $and: [{ territorio: args.territorio }, { noAbonado: true }] }).count();
        console.log(count, countContesto, countNoContesto, countDejarCarta, countNoLlamar);
        return {
            count,
            countContesto,
            countNoContesto,
            countDejarCarta,
            countNoLlamar,
            countNoAbonado
        };
    }
};
