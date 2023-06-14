"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketConnection = void 0;
const socket_io_1 = require("socket.io");
const server_1 = require("../server");
const log_services_1 = require("./log-services");
const connection = 'connection';
const householdChange = 'telephonic-household: change';
const userChange = 'user: change';
const hthChange = 'hth: change';
const socketConnection = (isProduction) => {
    new socket_io_1.Server(server_1.server, {
        cors: {
            origin: isProduction ? [server_1.domain] : [server_1.domain, server_1.testingDomain],
            methods: ["GET", "POST"],
            credentials: true
        }
    }).on(connection, (socket) => {
        socket.emit(connection, null);
        socket.on(householdChange, (objPackage) => {
            if (!objPackage)
                return;
            const territoryNumber = objPackage.territoryNumber;
            const updatedHousehold = objPackage.updatedHousehold;
            const userEmail = objPackage.userEmail;
            if (!territoryNumber || !updatedHousehold || !userEmail) {
                server_1.logger.Add(`Error en socket household change: ${territoryNumber} ${userEmail} ${JSON.stringify(updatedHousehold)}`, log_services_1.errorLogs);
                return;
            }
            socket.emit(householdChange, territoryNumber, updatedHousehold, userEmail);
            socket.broadcast.emit(householdChange, territoryNumber, updatedHousehold, userEmail);
        });
        socket.on(userChange, (updatedUser) => {
            socket.emit(userChange, updatedUser);
            socket.broadcast.emit(userChange, updatedUser);
        });
        socket.on(hthChange, (territoryNumber0, userEmail) => {
            if (!territoryNumber0 || !userEmail)
                return;
            socket.emit(hthChange, territoryNumber0, userEmail);
            socket.broadcast.emit(hthChange, territoryNumber0, userEmail);
        });
    });
};
exports.socketConnection = socketConnection;
