"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../controllers/database");
module.exports = {
    getVivienda: async () => {
        const vivienda = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).findOne();
        return vivienda;
    },
    getVivienda2: async (root, args) => {
        const vivienda = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).findOne({ inner_id: args.inner_id });
        return vivienda;
    }
};
