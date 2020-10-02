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
const database_1 = require("../controllers/database");
const functions = __importStar(require("../controllers/functions"));
const mongodb_1 = require("mongodb");
module.exports = {
    cambiarEstado: async (root, { input }) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.estado);
            await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateOne({ inner_id: input.inner_id }, { $set: { estado: input.estado, fechaUlt: Date.now() } });
            const viviendaNuevoEstado = await functions.searchBuildingByNumber(input.inner_id);
            return viviendaNuevoEstado;
        }
        catch (error) {
            console.log(error);
            return `Error cambiando estado, ${Date.now().toLocaleString()}`;
        }
    },
    cambiarNoAbonado: async (root, { input }) => {
        try {
            console.log("Cambiando estado,", input.inner_id, input.noAbonado);
            await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateOne({ inner_id: input.inner_id }, { $set: { noAbonado: input.noAbonado, fechaUlt: Date.now() } });
            const viviendaNoAbon = await functions.searchBuildingByNumber(input.inner_id);
            return viviendaNoAbon;
        }
        catch (error) {
            console.log(error);
            return `Error cambiando estado, ${Date.now().toLocaleString()}`;
        }
    },
    asignar: async (root, { input }) => {
        try {
            console.log(`Asignando territorio ${input.terr} a ${input.user_id}`);
            console.log(typeof input.user_id);
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $addToSet: { asign: parseInt(input.terr) }
            });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                email: busq.email,
                asign: busq.asign
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error asignando territorio, ${Date.now().toLocaleString()}`;
        }
    },
    desasignar: async (root, { input }) => {
        try {
            console.log(`Desasignando territorio ${input.terr} a ${input.user_id}`);
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $pull: { asign: { $in: [parseInt(input.terr)] } } }, { multi: true });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                email: busq.email,
                asign: busq.asign
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error desasignando territorio, ${Date.now().toLocaleString()}`;
        }
    },
    activar: async (root, { input }) => {
        try {
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { estado: "activado" } });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                _id: busq._id,
                email: busq.email,
                estado: busq.estado
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error activando usuario, ${Date.now().toLocaleString()}`;
        }
    },
    desactivar: async (root, { input }) => {
        try {
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { estado: "desactivado" } });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                _id: busq._id,
                email: busq.email,
                estado: busq.estado
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error desactivando usuario, ${Date.now().toLocaleString()}`;
        }
    },
    hacerAdmin: async (root, { input }) => {
        try {
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { role: 1 } });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                _id: busq._id,
                email: busq.email,
                role: busq.role
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error activando usuario, ${Date.now().toLocaleString()}`;
        }
    },
    deshacerAdmin: async (root, { input }) => {
        try {
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { role: 0 } });
            const busq = await functions.searchUserById(input.user_id);
            const user = {
                _id: busq._id,
                email: busq.email,
                role: busq.role
            };
            return user;
        }
        catch (error) {
            console.log(error);
            return `Error desactivando usuario, ${Date.now().toLocaleString()}`;
        }
    }
};