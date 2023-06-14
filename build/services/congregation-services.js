"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCongregationItems = void 0;
const axios_1 = __importDefault(require("axios"));
const server_1 = require("../server");
const env_variables_1 = require("../env-variables");
const getCongregationItems = async (requesterUser) => {
    if (!requesterUser)
        return null;
    const siteUrl = 'https://sites.google.com';
    try {
        const { data } = await axios_1.default.get(siteUrl + env_variables_1.googleSiteUrl);
        const items = [];
        const urlElements = data.split('data-url="');
        urlElements.forEach(x => items.push(x.split('"')[0]));
        items.shift();
        items.shift();
        const promisesArray = [];
        for (let i = 0; i < items.length; i++) {
            promisesArray.push(new Promise(async (resolve, reject) => {
                try {
                    const { data } = await axios_1.default.get(siteUrl + items[i]);
                    // const titleElements: string[] = data.split('</h2>')[0].split('>')
                    // const title: string = titleElements[titleElements.length - 1]
                    let title = items[i].split('/')[3].replace('-', ' ').replace('-', ' ').replace('-', ' ');
                    title = title.charAt(0).toUpperCase() + title.slice(1);
                    let ids = data.split('data-embed-doc-id="');
                    ids.shift();
                    ids = ids.map(x => x.split('"')[0]);
                    resolve({
                        ids,
                        title
                    });
                }
                catch (error) {
                    server_1.logger.Add(`No se pudo traer el identificador del PDF: ${error}`, 'ErrorLogs');
                    reject();
                }
            }));
        }
        const congregationItems = await Promise.all(promisesArray);
        return congregationItems;
    }
    catch (error) {
        server_1.logger.Add(`Falló la conexión con el sitio Google de los PDF: ${error}`, 'ErrorLogs');
        return null;
    }
};
exports.getCongregationItems = getCongregationItems;
