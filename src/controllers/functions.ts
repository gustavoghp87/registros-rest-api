import { client } from './database';

export const searchUserByEmail = async (email:string) => {
    const User = await client.db("Misericordia-Web").collection('usuarios').findOne({email});
    return User;
};

export const searchUserByToken = async (newtoken:string) => {
    const User = await client.db("Misericordia-Web").collection('usuarios').findOne({newtoken});
    return User;
};

export const addTokenToUser = async (email:string, token:string) => {
    try {
        await client.db("Misericordia-Web").collection('usuarios').updateOne({email}, {$set:{newtoken:token}});
        console.log("Token agregado a db correctamente", token);
        return true
    } catch(error) {
        console.log("Error al intentar agregar token a db...", error);
        return false
    }
};

export const searchBuildingsByNumber = async (num:string) => {
    const terr = await client.db("Misericordia-Web").collection('viviendas').find({territorio:num}).toArray();
    return terr;
};
