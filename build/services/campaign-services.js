"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableAccesibilityModeService = exports.askForANewCampaignPackService = exports.assignCampaignPackService = exports.closeCampaignPackService = exports.editCampaignPackService = exports.getCampaignPackService = exports.getCampaignPacksByUserService = exports.getCampaignPacksService = void 0;
const server_1 = require("../server");
const campaignDbConnection_1 = require("../services-db/campaignDbConnection");
const log_services_1 = require("./log-services");
const campaignDbConnection = new campaignDbConnection_1.CampaignDb();
const getCampaignPacksService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return null;
    const packs = await campaignDbConnection.GetCampaignPacks();
    return packs;
};
exports.getCampaignPacksService = getCampaignPacksService;
const getCampaignPacksByUserService = async (requesterUser) => {
    if (!requesterUser)
        return null;
    const packs = await campaignDbConnection.GetCampaignPacksByUser(requesterUser.email);
    if (!packs)
        return null;
    let campaignAssignments = [];
    packs.forEach(x => campaignAssignments.push(x.id));
    return campaignAssignments;
};
exports.getCampaignPacksByUserService = getCampaignPacksByUserService;
const getCampaignPackService = async (requesterUser, idString) => {
    // accessible
    let id = parseInt(idString);
    if (!id || isNaN(id))
        return null;
    const pack = await campaignDbConnection.GetCampaignPackById(id);
    if (!pack)
        return null;
    if (pack.isAccessible)
        return pack;
    if (!requesterUser)
        return null;
    if (pack.assignedTo !== requesterUser.email)
        return null;
    return pack;
};
exports.getCampaignPackService = getCampaignPackService;
const editCampaignPackService = async (requesterUser, id, phoneNumber, checked) => {
    // accessible
    if (!id || !phoneNumber)
        return null;
    let pack = await campaignDbConnection.GetCampaignPackById(id);
    if (!pack)
        return null;
    if (!pack.isAccessible && (!requesterUser || (pack.assignedTo !== requesterUser.email && requesterUser.role !== 1)))
        return null;
    if (!requesterUser)
        requesterUser = anonymousUser;
    checked = !!checked;
    const success = await campaignDbConnection.EditCampaignPackById(id, phoneNumber, checked);
    if (!success) {
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser === null || requesterUser === void 0 ? void 0 : requesterUser.email} no pudo cambiar teléfono de paquete ${id} ${phoneNumber} a ${checked}`, log_services_1.errorLogs);
        return null;
    }
    // checkIfTerritoryIsFinishedService
    pack = await campaignDbConnection.GetCampaignPackById(id);
    if (pack && pack.calledPhones.length === 50) {
        const success1 = await campaignDbConnection.CloseCampaignPack(id);
        if (success1)
            server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser === null || requesterUser === void 0 ? void 0 : requesterUser.email} terminó el paquete ${id}`, log_services_1.campaignLogs);
        else
            server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser === null || requesterUser === void 0 ? void 0 : requesterUser.email} no pudo cerrar el paquete ${id} después de terminarlo`, log_services_1.errorLogs);
    }
    pack = await campaignDbConnection.GetCampaignPackById(id);
    return pack;
};
exports.editCampaignPackService = editCampaignPackService;
const anonymousUser = {
    email: "anónimo por accesibilidad",
    group: 0,
    hthAssignments: [],
    id: 0,
    isActive: false,
    phoneAssignments: [],
    recoveryOptions: [],
    role: 0,
    tokenId: 0
};
const closeCampaignPackService = async (requesterUser, id) => {
    // accessible
    if (!id)
        return false;
    const pack = await campaignDbConnection.GetCampaignPackById(id);
    if (!pack)
        return false;
    if (!pack.isAccessible && (!requesterUser || (pack.assignedTo !== requesterUser.email && requesterUser.role !== 1)))
        return false;
    const success = await campaignDbConnection.CloseCampaignPack(id);
    if (!requesterUser)
        requesterUser = anonymousUser;
    if (success)
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser === null || requesterUser === void 0 ? void 0 : requesterUser.email} marcó como terminado el paquete ${id}`, log_services_1.campaignLogs);
    return success;
};
exports.closeCampaignPackService = closeCampaignPackService;
const assignCampaignPackService = async (requesterUser, idString, email) => {
    let id = parseInt(idString);
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!id || isNaN(id) || !email)
        return false;
    const success = await campaignDbConnection.AssignCampaignPackByEmail(id, email);
    if (success)
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} asignó el paquete ${id} a ${email}`, log_services_1.campaignLogs);
    else
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo asignar el paquete ${id} a ${email}`, log_services_1.errorLogs);
    return success;
};
exports.assignCampaignPackService = assignCampaignPackService;
const askForANewCampaignPackService = async (requesterUser) => {
    if (!requesterUser)
        return false;
    const id = await campaignDbConnection.AskForANewCampaignPack(requesterUser.email);
    if (id)
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} recibió el paquete ${id} por solicitud automática`, log_services_1.campaignLogs);
    return !!id;
};
exports.askForANewCampaignPackService = askForANewCampaignPackService;
const enableAccesibilityModeService = async (requesterUser, id, accessible) => {
    if (!requesterUser || requesterUser.role !== 1)
        return false;
    if (!id)
        return false;
    accessible = !!accessible;
    const success = await campaignDbConnection.ChangeAccesibilityMode(id, accessible);
    if (!success) {
        server_1.logger.Add(`Admin ${requesterUser.email} no pudo habilitar el modo de accesibilidad para el paquete ${id} ${accessible}`, log_services_1.campaignLogs);
        return false;
    }
    server_1.logger.Add(`Admin ${requesterUser.email} ${accessible ? "habilitó" : "deshabilitó"} el modo de accesibilidad para el paquete ${id} ${accessible}`, log_services_1.campaignLogs);
    return true;
};
exports.enableAccesibilityModeService = enableAccesibilityModeService;
