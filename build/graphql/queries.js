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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = __importStar(require("../controllers/functions"));
module.exports = {
    getApartmentsByTerritory: async (root, args) => {
        const viviendas = await functions.searchTerritoryByNumber(args.terr);
        return viviendas;
    },
    getApartment: async (root, args) => {
        const vivienda = await functions.searchBuildingByNumber(args.inner_id);
        return vivienda;
    },
    getUsers: async () => {
        try {
            const users = await functions.searchAllUsers();
            return users;
        }
        catch (error) {
            console.log(error, `${Date.now().toLocaleString()}`);
            return `Error desactivando usuario`;
        }
    }
};
