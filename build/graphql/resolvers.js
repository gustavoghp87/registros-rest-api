"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubsub = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.pubsub = new apollo_server_express_1.PubSub();
module.exports = {
    Mutation: require('./mutations'),
    Query: require('./queries'),
    Subscription: {
        escucharCambioDeEstado: {
            subscribe: () => {
                console.log(`escuchando /////////////////////////////////////`);
                return exports.pubsub.asyncIterator('cambiarEstado');
            }
        }
    }
};
