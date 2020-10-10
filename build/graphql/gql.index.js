"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const graphql_tools_1 = require("graphql-tools");
const fs_1 = require("fs");
const path_1 = require("path");
const server_1 = require("../server");
const http_1 = require("http");
const apollo_server_express_1 = require("apollo-server-express");
const router = express_1.default.Router();
const resolvers = require('./resolvers');
const typeDefs = fs_1.readFileSync(path_1.join(__dirname, "schema.graphql"), 'utf-8');
exports.schema = graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers });
router.use('/', express_graphql_1.graphqlHTTP({
    schema: exports.schema,
    rootValue: resolvers,
    graphiql: server_1.NODE_ENV === 'dev' ? true : false
}));
module.exports = router;
const server = new apollo_server_express_1.ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app: server_1.app });
const httpServer = http_1.createServer(server_1.app);
server.installSubscriptionHandlers(httpServer);
httpServer.listen(server_1.port, () => {
    console.log(`Server ready at http://localhost:${server_1.port}${server.graphqlPath}`);
    console.log(`Subscriptions ready at ws://localhost:${server_1.port}${server.subscriptionsPath}`);
});
//////////////////////////////////////////////////
// const port2 = process.env.PORT ? process.env.PORT + 1 : 4006
// const apollo = new ApolloServer({
//     typeDefs,
//     resolvers,
//     playground: {
//         endpoint: `http:localhost:${port2}`
//     }
// })
// apollo.applyMiddleware({app})
// const ws = createServer(app)
// apollo.installSubscriptionHandlers(ws)
// ws.listen({port: port2}, () => {
//     console.log("\n\nSubscriptions URL: port", port2, '/graphql')
// })
