import dotenv from 'dotenv'
dotenv.config()


const MongoClient = require('mongodb').MongoClient

export const client = new MongoClient( process.env.DB_URL,
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
);

(async () => {
    await client.connect()
})()
