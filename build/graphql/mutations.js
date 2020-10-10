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
const auth_1 = require("../controllers/auth");
const mongodb_1 = require("mongodb");
const resolvers_1 = require("./resolvers");
module.exports = {
    controlarUsuario: async (root, { input }) => {
        console.log("aca1", input);
        const userAuth = await auth_1.adminGraph(input.token);
        if (!userAuth)
            return null;
        console.log("Actualizando ", input.user_id);
        await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { estado: input.estado, role: input.role, group: input.group } });
        const user = await functions.searchUserById(input.user_id);
        resolvers_1.pubsub.publish('cambiarUsuario', { escucharCambioDeUsuario: user });
        return user;
    },
    asignar: async (root, { input }) => {
        const userAuth = await auth_1.adminGraph(input.token);
        if (!userAuth)
            return null;
        if (input.all)
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { asign: [] } });
        if (input.asignar) {
            const userToMod = await functions.searchUserById(input.user_id);
            if (!userToMod)
                return null;
            let arrayV = userToMod.asign || [];
            arrayV.indexOf(input.asignar) === -1 ? arrayV.push(input.asignar) : console.log("Ya estaba");
            arrayV.sort((a, b) => a - b);
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $set: { asign: arrayV } });
        }
        if (input.desasignar)
            await database_1.client.db(database_1.dbMW).collection(database_1.collUsers).updateOne({ _id: new mongodb_1.ObjectId(input.user_id) }, { $pullAll: { asign: [input.desasignar] }
            });
        const user = await functions.searchUserById(input.user_id);
        resolvers_1.pubsub.publish('cambiarUsuario', { escucharCambioDeUsuario: user });
        return user;
    },
    cambiarEstado: async (root, { input }) => {
        const userAuth = await auth_1.authGraph(input.token);
        if (!userAuth)
            return null;
        console.log("Cambiando estado,", input.inner_id, input.estado, input.noAbonado);
        await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).updateOne({ inner_id: input.inner_id }, { $set: { estado: input.estado, noAbonado: input.noAbonado, fechaUlt: Date.now() } });
        const viviendaNuevoEstado = await functions.searchBuildingByNumber(input.inner_id);
        resolvers_1.pubsub.publish('cambiarEstado', { escucharCambioDeEstado: viviendaNuevoEstado });
        return viviendaNuevoEstado;
    },
    agregarVivienda: async (root, { input }) => {
        try {
            const userAuth = await auth_1.adminGraph(input.token);
            if (!userAuth)
                return null;
            let inner_id = "24878";
            let busqMayor = true;
            while (busqMayor) {
                inner_id = (parseInt(inner_id) + 1).toString();
                busqMayor = await functions.searchBuildingByNumber(inner_id);
            }
            console.log("El inner_id que sige es ", inner_id);
            const estado = input.estado ? input.estado : "No predicado";
            const noAbonado = input.noAbonado ? input.noAbonado : false;
            const fechaUlt = input.estado || input.noAbonado ? Date.now() : null;
            await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).insertOne({
                inner_id,
                territorio: input.territorio,
                manzana: input.manzana,
                direccion: input.direccion,
                telefono: input.telefono,
                estado,
                noAbonado,
                fechaUlt
            });
            const viviendaNueva = await functions.searchBuildingByNumber(inner_id);
            console.log(viviendaNueva);
            return viviendaNueva;
        }
        catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`);
            return null;
        }
    }
};
