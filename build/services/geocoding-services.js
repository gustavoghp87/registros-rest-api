"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGeocodingFromCoordinatesService = exports.getGeocodingFromAddressService = void 0;
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const env_variables_1 = require("../env-variables");
const server_1 = require("../server");
const log_services_1 = require("./log-services");
const getGeocodingFromAddressService = async (requesterUser, address) => {
    if (!requesterUser)
        return null;
    try {
        const response = await (0, node_geocoder_1.default)({
            provider: 'google',
            // fetch: customFetchImplementation,
            apiKey: env_variables_1.googleGeocodingAPIKey,
            formatter: null
        }).geocode({
            address,
            country: 'Argentine'
        });
        if (!response || !response[0] || !response[0].latitude || !response[0].longitude)
            return null;
        return {
            lat: response[0].latitude,
            lng: response[0].longitude
        };
    }
    catch (error) {
        server_1.logger.Add(`No se pudo geolocalizar desde dirección ${address}: ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.getGeocodingFromAddressService = getGeocodingFromAddressService;
const getGeocodingFromCoordinatesService = async (requesterUser, coordinates) => {
    if (!requesterUser || !coordinates || !coordinates.lat || !coordinates.lng)
        return null;
    try {
        const response = await (0, node_geocoder_1.default)({
            provider: 'google',
            // fetch: customFetchImplementation,
            apiKey: env_variables_1.googleGeocodingAPIKey,
            formatter: null
        }).reverse({
            lat: coordinates.lat,
            lon: coordinates.lng
        });
        if (!response || !response[0] || !response[0].formattedAddress)
            return null;
        return response[0].formattedAddress;
    }
    catch (error) {
        server_1.logger.Add(`No se pudo geolocalizar desde coordenadas ${coordinates === null || coordinates === void 0 ? void 0 : coordinates.lat} ${coordinates === null || coordinates === void 0 ? void 0 : coordinates.lng}: ${error}`, log_services_1.errorLogs);
        return null;
    }
};
exports.getGeocodingFromCoordinatesService = getGeocodingFromCoordinatesService;
