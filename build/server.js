"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.logger = exports.dbClient = exports.testingDomain = exports.domain = exports.accessTokensExpiresIn = exports.testingDb = exports.isProduction = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const controllers = __importStar(require("./controllers"));
const env_variables_1 = require("./env-variables");
const _dbConnection_1 = require("./services-db/_dbConnection");
const broadcast_services_1 = require("./services/broadcast-services");
const log_services_1 = require("./services/log-services");
const set_up_user_service_1 = require("./services/set-up-user-service");
exports.isProduction = env_variables_1.environment === 'prod';
exports.testingDb = !exports.isProduction;
exports.accessTokensExpiresIn = '2160h'; // 90 days
exports.domain = "https://www.misericordiaweb.com";
exports.testingDomain = "http://localhost:3000";
exports.dbClient = new _dbConnection_1.DbConnection(exports.testingDb);
exports.logger = new log_services_1.Logger();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: exports.isProduction ? [exports.domain] : [exports.domain, exports.testingDomain] }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'build')));
//app.use('/api/campaign', setUpUser, controllers.campaignController)
app.use('/api/congregation', set_up_user_service_1.setUpUser, controllers.congregationController);
app.use('/api/email', set_up_user_service_1.setUpUser, controllers.emailController);
app.use('/api/log', set_up_user_service_1.setUpUser, controllers.logController);
app.use('/api/house-to-house', set_up_user_service_1.setUpUser, controllers.houseToHouseController);
app.use('/api/geocoding', set_up_user_service_1.setUpUser, controllers.geocodingController);
app.use('/api/telephonic', set_up_user_service_1.setUpUser, controllers.telephonicController);
app.use('/api/user', set_up_user_service_1.setUpUser, controllers.userController);
app.use('/api/weather', set_up_user_service_1.setUpUser, controllers.weatherController);
exports.server = app.listen(env_variables_1.port, () => {
    console.log(`\n\n\nListening on port ${env_variables_1.port}`);
    (0, broadcast_services_1.socketConnection)(exports.isProduction);
});
