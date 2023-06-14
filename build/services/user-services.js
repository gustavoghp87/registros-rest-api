"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserService = exports.recoverAccountService = exports.logoutAllService = exports.loginUserService = exports.getUsersService = exports.getUsersNotAuthService = exports.getUserById = exports.getUserByEmailService = exports.getUserByEmailLinkService = exports.getActivatedUserByAccessTokenService = exports.generateAccessTokenService = exports.editUserService = exports.deleteUserService = exports.deallocateMyTLPTerritoryService = exports.changePswService = exports.changePswOtherUserService = exports.changePswByEmailLinkService = exports.assignTLPTerritoryService = exports.assignHTHTerritoryService = void 0;
const server_1 = require("../server");
const email_services_1 = require("./email-services");
const log_services_1 = require("./log-services");
const helpers_1 = require("./helpers");
const recaptcha_services_1 = require("./recaptcha-services");
const bcrypt_services_1 = require("./bcrypt-services");
const jwt_services_1 = require("./jwt-services");
const userDbConnection_1 = require("../services-db/userDbConnection");
const userDbConnection = new userDbConnection_1.UserDb();
const assignHTHTerritoryService = async (requesterUser, email, toAssign, toUnassign, all) => {
    var _a, _b;
    all = !!all;
    if (toAssign) {
        toAssign = parseInt(toAssign.toString());
        if (isNaN(toAssign))
            return null;
    }
    if (toUnassign) {
        toUnassign = parseInt(toUnassign.toString());
        if (isNaN(toUnassign))
            return null;
    }
    const userToEdit = await userDbConnection.GetUserByEmail(email);
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all))
        return null;
    const updatedUser = await userDbConnection.AssignHTHTerritory(email, toAssign, toUnassign, all);
    if (updatedUser)
        server_1.logger.Add(`Admin ${requesterUser.email} modificó las asignaciones de Casa en Casa de ${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email}: asignados antes ${((_a = userToEdit.phoneAssignments) === null || _a === void 0 ? void 0 : _a.length) ? userToEdit.phoneAssignments : "ninguno"}, ahora ${((_b = updatedUser.hthAssignments) === null || _b === void 0 ? void 0 : _b.length) ? updatedUser.hthAssignments : "ninguno"}`, log_services_1.userLogs);
    return updatedUser;
};
exports.assignHTHTerritoryService = assignHTHTerritoryService;
const assignTLPTerritoryService = async (requesterUser, email, toAssign, toUnassign, all) => {
    var _a, _b;
    all = !!all;
    if (toAssign) {
        toAssign = parseInt(toAssign.toString());
        if (isNaN(toAssign))
            return null;
    }
    if (toUnassign) {
        toUnassign = parseInt(toUnassign.toString());
        if (isNaN(toUnassign))
            return null;
    }
    const userToEdit = await userDbConnection.GetUserByEmail(email);
    if (!requesterUser || requesterUser.role !== 1 || !userToEdit || (!toAssign && !toUnassign && !all))
        return null;
    const updatedUser = await userDbConnection.AssignTLPTerritory(email, toAssign, toUnassign, all);
    if (updatedUser)
        server_1.logger.Add(`Admin ${requesterUser.email} modificó las asignaciones Telefónica de ${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.email}: asignados antes ${((_a = userToEdit.phoneAssignments) === null || _a === void 0 ? void 0 : _a.length) ? userToEdit.phoneAssignments : "ninguno"}, ahora ${((_b = updatedUser.phoneAssignments) === null || _b === void 0 ? void 0 : _b.length) ? updatedUser.phoneAssignments : "ninguno"}`, log_services_1.userLogs);
    return updatedUser;
};
exports.assignTLPTerritoryService = assignTLPTerritoryService;
const changePswByEmailLinkService = async (id, newPsw) => {
    if (!newPsw || typeof newPsw !== 'string' || newPsw.length < 8)
        return null;
    const user = await (0, exports.getUserByEmailLinkService)(id);
    if (!user || !user.id || !user.recoveryOptions || !user.tokenId)
        return null;
    const recoveryOption = user.recoveryOptions.find(x => x.id === id);
    if (!recoveryOption)
        return null;
    if (recoveryOption.expiration < +new Date())
        return 'expired';
    if (recoveryOption.used)
        return 'used';
    const encryptedPassword = await (0, bcrypt_services_1.generatePasswordHash)(newPsw);
    if (!encryptedPassword)
        return null;
    const success = await userDbConnection.ChangePsw(user.email, encryptedPassword);
    if (!success)
        return null;
    server_1.logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} cambió su contraseña por link de email`, log_services_1.loginLogs);
    const successSetAsUsed = await userDbConnection.SetRecoveryOptionAsUsed(user.email, id);
    if (!successSetAsUsed)
        server_1.logger.Add(`No se pudo setear como usada la opción de recuperación para ${user.email} ${id}`, log_services_1.errorLogs);
    const newToken = (0, exports.generateAccessTokenService)(user, user.tokenId);
    return newToken;
};
exports.changePswByEmailLinkService = changePswByEmailLinkService;
const changePswOtherUserService = async (requesterUser, email) => {
    const user = await (0, exports.getUserByEmailService)(email);
    if (!requesterUser || requesterUser.role !== 1 || !user)
        return null;
    const newPsw = (0, helpers_1.getRandomId12)();
    const encryptedPassword = await (0, bcrypt_services_1.generatePasswordHash)(newPsw);
    if (!encryptedPassword)
        return null;
    const success = await userDbConnection.ChangePsw(email, encryptedPassword);
    if (success)
        server_1.logger.Add(`Admin ${requesterUser.email} cambió la contraseña de ${email}`, log_services_1.loginLogs);
    return success ? newPsw : null;
};
exports.changePswOtherUserService = changePswOtherUserService;
const changePswService = async (requesterUser, psw, newPsw) => {
    if (!requesterUser || !requesterUser.password || !requesterUser.id || !psw || !newPsw || newPsw.length < 8)
        return null;
    let compare = await (0, bcrypt_services_1.comparePasswordsService)(psw, requesterUser.password);
    if (!compare)
        return 'wrongPassword';
    const encryptedPassword = await (0, bcrypt_services_1.generatePasswordHash)(newPsw);
    if (!encryptedPassword)
        return null;
    const success = await userDbConnection.ChangePsw(requesterUser.email, encryptedPassword);
    if (!success) {
        server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} no pudo cambiar su contraseña usando la que tenía`, log_services_1.loginLogs);
        return null;
    }
    server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cambió su contraseña usando la que tenía`, log_services_1.loginLogs);
    const newToken = (0, exports.generateAccessTokenService)(requesterUser, requesterUser.tokenId || 1);
    return newToken;
};
exports.changePswService = changePswService;
const deallocateMyTLPTerritoryService = async (user, territoryNumber) => {
    // no auth
    if (!user)
        return false;
    const toUnassign = parseInt(territoryNumber);
    if (!toUnassign || isNaN(toUnassign)) {
        server_1.logger.Add(`Falló deallocateMyTLPTerritoryService(): ${toUnassign}`, log_services_1.errorLogs);
        return false;
    }
    const updatedUser = await userDbConnection.AssignTLPTerritory(user.email, 0, toUnassign, false);
    if (updatedUser)
        server_1.logger.Add(`Se desasignó el territorio de telefónica ${toUnassign} a ${user.email} porque lo cerró`, log_services_1.userLogs);
    else
        server_1.logger.Add(`El ${user.role === 1 ? 'admin' : 'usuario'} ${user.email} no pudo ser desasignado del territorio de telefónica ${toUnassign} después de cerrarlo`, log_services_1.errorLogs);
    return !!updatedUser;
};
exports.deallocateMyTLPTerritoryService = deallocateMyTLPTerritoryService;
const deleteUserService = async (requesterUser, userId) => {
    var _a, _b;
    if (!requesterUser || requesterUser.role !== 1 || !userId || typeof userId !== 'number')
        return false;
    const userToRemove = await userDbConnection.GetUserById(userId);
    if (!userToRemove || userToRemove.isActive || userToRemove.role !== 0 || ((_a = userToRemove.hthAssignments) === null || _a === void 0 ? void 0 : _a.length)
        || ((_b = userToRemove.phoneAssignments) === null || _b === void 0 ? void 0 : _b.length))
        return false;
    const success = await userDbConnection.DeleteUser(userId);
    if (success)
        server_1.logger.Add(`Admin ${requesterUser.email} eliminó al usuario ${userToRemove.email}`, log_services_1.userLogs);
    else
        server_1.logger.Add(`Admin ${requesterUser.email} quiso eliminar al usuario ${userToRemove.email} pero algo falló`, log_services_1.errorLogs);
    return success;
};
exports.deleteUserService = deleteUserService;
const editUserService = async (requesterUser, email, isActive, role, group) => {
    isActive = !!isActive;
    role = parseInt(role.toString());
    group = parseInt(group.toString());
    if (isNaN(role) || isNaN(group))
        return null;
    if (!requesterUser || requesterUser.role !== 1 || !email || typeof role !== 'number' || typeof group !== 'number')
        return null;
    const updatedUser = await userDbConnection.EditUserState(email, isActive, role, group);
    if (updatedUser)
        server_1.logger.Add(`Admin ${requesterUser.email} modificó al usuario ${updatedUser.email}: activado ${updatedUser.isActive}, rol ${updatedUser.role}, grupo ${updatedUser.group}`, log_services_1.userLogs);
    return updatedUser;
};
exports.editUserService = editUserService;
const generateAccessTokenService = (user, tokenId) => {
    if (!user || !user.id || !tokenId)
        return null; // change to id
    const newToken = (0, jwt_services_1.signUserService)(user.id, tokenId); // change to id
    if (!newToken) {
        server_1.logger.Add(`Falló generateAccessTokenService() ${user.email} ${user.id} ${tokenId}`, log_services_1.errorLogs);
        return null;
    }
    server_1.logger.Add(`Se logueó el usuario ${user.email}`, log_services_1.loginLogs);
    return newToken;
};
exports.generateAccessTokenService = generateAccessTokenService;
const getActivatedUserByAccessTokenService = async (token) => {
    if (!token)
        return null;
    const decoded = (0, jwt_services_1.decodeVerifiedService)(token);
    if (!decoded || !decoded.userId || !decoded.tokenId)
        return null; // change to id
    const user = await userDbConnection.GetUserById(decoded.userId);
    if (!user || user.tokenId !== decoded.tokenId)
        return null;
    return user && user.isActive ? user : null;
};
exports.getActivatedUserByAccessTokenService = getActivatedUserByAccessTokenService;
const getUserByEmailLinkService = async (id) => {
    if (!id)
        return null;
    const users = await userDbConnection.GetAllUsers();
    if (!users)
        return null;
    let user0 = users.find(x => x.recoveryOptions.find(y => y.id === id) !== undefined);
    return user0 !== null && user0 !== void 0 ? user0 : null;
};
exports.getUserByEmailLinkService = getUserByEmailLinkService;
const getUserByEmailService = async (email) => {
    if (!email)
        return null;
    const user = await userDbConnection.GetUserByEmail(email);
    return user;
};
exports.getUserByEmailService = getUserByEmailService;
const getUserById = async (id) => {
    const user = await userDbConnection.GetUserById(id);
    return user;
};
exports.getUserById = getUserById;
const getUsersNotAuthService = async () => {
    // without permission filter
    let users = await userDbConnection.GetAllUsers();
    if (!users)
        return null;
    users = users.reverse();
    return users;
};
exports.getUsersNotAuthService = getUsersNotAuthService;
const getUsersService = async (requesterUser) => {
    if (!requesterUser || requesterUser.role !== 1)
        return null;
    let users = await userDbConnection.GetAllUsers();
    if (!users)
        return null;
    users = users.reverse();
    return users;
};
exports.getUsersService = getUsersService;
const loginUserService = async (email, password, recaptchaToken) => {
    const checkRecaptch = await (0, recaptcha_services_1.checkRecaptchaTokenService)(recaptchaToken);
    if (!checkRecaptch)
        return 'recaptchaFailed';
    const user = await (0, exports.getUserByEmailService)(email);
    if (!user || !user.password || !user.tokenId || !user.id)
        return null;
    if (!user.isActive)
        return 'isDisabled';
    const match = await (0, bcrypt_services_1.comparePasswordsService)(password, user.password);
    if (!match)
        return null;
    const newToken = (0, exports.generateAccessTokenService)(user, user.tokenId);
    return newToken;
};
exports.loginUserService = loginUserService;
const logoutAllService = async (requesterUser) => {
    if (!requesterUser || !requesterUser.tokenId || !requesterUser.id)
        return null;
    const success = await userDbConnection.UpdateTokenId(requesterUser.id, requesterUser.tokenId + 1);
    if (!success)
        return null;
    server_1.logger.Add(`${requesterUser.role === 1 ? 'Admin' : 'Usuario'} ${requesterUser.email} cerró todas las sesiones`, log_services_1.loginLogs);
    const newToken = (0, exports.generateAccessTokenService)(requesterUser, requesterUser.tokenId + 1);
    return newToken;
};
exports.logoutAllService = logoutAllService;
const recoverAccountService = async (email) => {
    if (!email)
        return "no user";
    const user = await (0, exports.getUserByEmailService)(email);
    if (!user)
        return "no user";
    const id = (0, helpers_1.getRandomId24)();
    let success = await userDbConnection.AddRecoveryOption(email, id);
    if (!success)
        return "";
    server_1.logger.Add(`${user.role === 1 ? 'Admin' : 'Usuario'} ${user.email} solicitó un email de recuperación de contraseña`, log_services_1.loginLogs);
    success = await (0, email_services_1.sendRecoverAccountEmailService)(email, id);
    if (!success)
        return "not sent";
    return "ok";
};
exports.recoverAccountService = recoverAccountService;
const registerUserService = async (email, password, groupString) => {
    const group = parseInt(groupString);
    if (!email || !email.includes("@") || !password || password.length < 8 || !group || isNaN(group))
        return false;
    const encryptedPassword = await (0, bcrypt_services_1.generatePasswordHash)(password);
    if (!encryptedPassword)
        return false;
    const newUser = {
        email,
        group,
        hthAssignments: [],
        id: +new Date(),
        isActive: false,
        password: encryptedPassword,
        phoneAssignments: [],
        recoveryOptions: [],
        role: 0,
        tokenId: 1
    };
    const success = await userDbConnection.RegisterUser(newUser);
    if (success)
        server_1.logger.Add(`Se registró un usuario con email ${email} y grupo ${group}`, log_services_1.loginLogs);
    return success;
};
exports.registerUserService = registerUserService;
