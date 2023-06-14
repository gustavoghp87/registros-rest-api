"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentLocalDate = exports.filterHouses = exports.isTerritoryAssignedToUserService = exports.getRandomId12 = exports.getRandomId24 = void 0;
const getRandomCharacter = (i) => Math.random().toString(36).slice(i * -1);
const getRandomId24 = () => getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4);
exports.getRandomId24 = getRandomId24;
const getRandomId12 = () => getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4);
exports.getRandomId12 = getRandomId12;
const isTerritoryAssignedToUserService = (user, territoryNumber) => {
    var _a;
    return (_a = user.phoneAssignments) === null || _a === void 0 ? void 0 : _a.some((assignedTerritory) => assignedTerritory.toString() === territoryNumber);
};
exports.isTerritoryAssignedToUserService = isTerritoryAssignedToUserService;
const filterHouses = (households) => {
    return households.filter(x => x.doorBell);
};
exports.filterHouses = filterHouses;
const getCurrentLocalDate = (timestamp) => {
    if (timestamp)
        new Date(timestamp).toLocaleDateString('es-AR');
    return new Date().toLocaleDateString('es-AR');
};
exports.getCurrentLocalDate = getCurrentLocalDate;
