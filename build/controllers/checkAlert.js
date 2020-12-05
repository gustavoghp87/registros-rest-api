"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlert = void 0;
const database_1 = require("./database");
const email_1 = require("./email");
// esta función chequea en base de datos si ya se envió una alerta por email en las últimas 24 hs
exports.checkAlert = async () => {
    const timestampRightNow = +new Date();
    console.log(`Timestamp: ${timestampRightNow}`);
    new Promise(resolve => setTimeout(resolve, 10000)).then(async () => {
        const lastEmailTime = (await database_1.client.db(database_1.dbMW).collection('emailAlert').findOne()).lastEmail;
        console.log(`Timestamp ultimo email: ${lastEmailTime}`);
        console.log(`Diferencia: ${timestampRightNow - lastEmailTime}, o sea ${(timestampRightNow - lastEmailTime) / 1000 / 60 / 60} horas`);
        //if (timestampRightNow - lastEmailTime > 86400000) checkTerritories()   // 24 horas
        checkTerritories();
    });
};
// esta función chequea si hay territorios acabados o por acabarse y ordena el envío del email
const checkTerritories = async () => {
    console.log("Ejecutando checkTerritories");
    let alert = [];
    let i = 1;
    while (i < 57) {
        const libres = await database_1.client.db(database_1.dbMW).collection(database_1.collTerr).find({
            $and: [
                { territorio: i.toString() },
                { estado: 'No predicado' },
                { $or: [{ noAbonado: false }, { noAbonado: null }] }
            ]
        }).count();
        console.log(`Territorio ${i}, libres: ${libres}`);
        if (libres < 50)
            alert.push(i);
        console.log(`Alert: ${alert}`);
        i++;
    }
    if (alert.length)
        email_1.sendEmail(alert);
};
