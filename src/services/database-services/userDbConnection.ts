import { ObjectId } from 'mongodb'
import { typeUser } from '../../models/user'
import { dbClient } from '../../server';
import { collUsers, dbMW } from './_dbConnection'

export class UserDb {
    
    async SearchUserByEmail(email: string) {
        try {
            const user = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ email })
            if (!user) {console.log("User not found by email in db"); return null}
            console.log("Search by email in db,", user?.email)
            return user
        } catch (error) {
            console.log("Db user by email", error)
            return null
        }
    }
    async SearchUserByToken(token: string) {
        try {
            const user = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ newtoken: token })
            if (!user) {console.log("User not found by token in db"); return null}
            console.log("Search by token db,", user.email)
            return user
        } catch (error) {
            console.log("Db user by token", error)
            return null
        }
    }
    async SearchUserById(_id: string) {
        const user = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(_id) })
        if (user) console.log("Search user by Id 2,", user.email)
        else console.log("Search user by Id 2: Not found")
        return user
    }
    async SearchAllUsers() {
        const users = await dbClient.Client.db(dbMW).collection(collUsers).find().toArray() as typeUser[] || null
        console.log("Search all users:", users.length)
        return users
    }
    async AddTokenToUser(email: string, token: string) {
        await dbClient.Client.db(dbMW).collection(collUsers).updateOne({ email }, { $set: { newtoken: token } })
        const user = await this.SearchUserByToken(token)
        if (!user || user.email !== email) return false
        return true
    }
    async RegisterUser(newUser: any) {
        await dbClient.Client.db(dbMW).collection(collUsers).insertOne(newUser)
        const user = await this.SearchUserByEmail(newUser.email)
        if (!user) return false
        return true
    }
    async ChangeMode(email: string, darkMode: boolean) {
        await dbClient.Client.db(dbMW).collection(collUsers).updateOne({ email }, { $set: { darkMode } })
        const user = await this.SearchUserByEmail(email)
        if (!user || user.darkMode !== darkMode) return false
        return true
    }
    async ChangePsw(email: string, passwordEncrypted: string) {
        await dbClient.Client.db(dbMW).collection(collUsers).updateOne({ email }, { $set: { password: passwordEncrypted } })
        const user = await this.SearchUserByEmail(email)
        if (!user || user.password !== passwordEncrypted) return false
        return true
    }
    async UpdateUserState(input: any) {
        try {
            await dbClient.Client.db(dbMW).collection(collUsers).updateOne(
                { _id: new ObjectId(input.user_id) },
                { $set: { estado:input.estado, role:input.role, group:input.group } }
            )
            const user = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
            if (!user || user.estado !== input.estado || user.role !== input.role || user.group !== input.group) return null
            return user
        } catch (error) {
            console.log("Update User State GraphQL failed:", error)
            return null
        }
    }
    async AssignTerritory(input: any) {
        try {
            if (input.all) await dbClient.Client.db(dbMW).collection(collUsers).updateOne(           // desasign all
                {_id: new ObjectId(input.user_id)},
                {$set: {asign: []}}
            )
            if (input.asignar) {
                const userToMod = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
                if (!userToMod) return null
                let arrayV = userToMod.asign || []
                arrayV.indexOf(input.asignar)===-1 ? arrayV.push(input.asignar) : console.log("Ya estaba")
                arrayV.sort((a:number, b:number) => a - b)
                await dbClient.Client.db(dbMW).collection(collUsers).updateOne(
                    { _id: new ObjectId(input.user_id) },
                    { $set: { asign: arrayV } }
                )
            }
            if (input.desasignar) await dbClient.Client.db(dbMW).collection(collUsers).updateOne(
                { _id: new ObjectId(input.user_id) },
                { $pullAll: { asign: [input.desasignar] } }
            )
            const user = await dbClient.Client.db(dbMW).collection(collUsers).findOne({ _id: new ObjectId(input.user_id) })
            if (!user) return null
            return user
        } catch (error) {
            console.log("Asign Territory GraphQL failed:", error)
            return null
        }
    }
}
