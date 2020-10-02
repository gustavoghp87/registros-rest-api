"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_graphql_1 = require("express-graphql");
const graphql_tools_1 = require("graphql-tools");
const fs_1 = require("fs");
const path_1 = require("path");
const router = express_1.default.Router();
const resolvers = require('./resolvers');
const typeDefs = fs_1.readFileSync(path_1.join(__dirname, "schema.graphql"), 'utf-8');
const schema = graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers });
router.use('/graphql', express_graphql_1.graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true
}));
module.exports = router;
