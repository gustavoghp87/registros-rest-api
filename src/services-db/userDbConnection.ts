import { dbClient } from '../server';
import { ObjectId } from 'mongodb'
import { typeUser } from '../models/user'

export class UserDb {
    async GetUserByEmail(email: string): Promise<typeUser|null> {
        try {
            const user: typeUser|null = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).findOne({ email })
            if (!user) {console.log("User not found by email in db"); return null}
            console.log("Search by email in db,", user?.email)
            return user
        } catch (error) {
            console.log("Db user by email", error)
            return null
        }
    }
    async GetUserByToken(token: string): Promise<typeUser|null> {
        try {
            const user: typeUser|null = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).findOne({ newtoken: token })
            if (!user) { console.log("User not found by token in db"); return null }
            console.log("Search by token db,", user.email)
            return user
        } catch (error) {
            console.log("Db user by token", error)
            return null
        }
    }
    async GetUserById(_id: string): Promise<typeUser|null> {   // no se usaría
        try {
            const user: typeUser|null = await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).findOne({ _id: new ObjectId(_id) })
            if (!user) { console.log(`Search user by Id ${_id}: Not found`); return null }
            return user
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async SearchAllUsers(): Promise<typeUser[]|null> {
        try {
            const users: typeUser[]|null =
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).find().toArray() as typeUser[] || null
            console.log("Search all users:", users.length)
            return users
        } catch (error) {
            console.log(error)
            return null
        }
    }
    async AddTokenToUser(email: string, token: string): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne({ email }, { $set: { newtoken: token } })
            const user: typeUser|null = await this.GetUserByToken(token)
            if (!user || user.email !== email) return false
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async RegisterUser(newUser: typeUser): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).insertOne(newUser)
            const user: typeUser|null = await this.GetUserByEmail(newUser.email)
            if (!user) return false
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async ChangeMode(email: string, darkMode: boolean): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne({ email }, { $set: { darkMode } })
            const user: typeUser|null = await this.GetUserByEmail(email)
            if (!user || user.darkMode !== darkMode) return false
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async ChangePsw(email: string, passwordEncrypted: string): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne({ email }, { $set: { password: passwordEncrypted } })
            const user: typeUser|null = await this.GetUserByEmail(email)
            if (!user || user.password !== passwordEncrypted) return false
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
    async UpdateUserState(user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> {
        try {
            await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { estado, role, group } }
            )
            const user: typeUser|null = await this.GetUserById(user_id)
            if (!user || user.estado !== estado || user.role !== role || user.group !== group) return null
            return user
        } catch (error) {
            console.log("Update User State failed:", error)
            return null
        }
    }
    async AssignTerritory(user_id: string, asignar: number, desasignar: number, all: boolean): Promise<typeUser|null> {
        try {
            if (all) await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne(           // desasign all
                { _id: new ObjectId(user_id) },
                { $set: { asign: [] } }
            )
            else if (asignar !== 0) {
                const userToMod: typeUser|null = await this.GetUserById(user_id)
                if (!userToMod) return null
                let arrayV: number[] = userToMod.asign || []
                arrayV.indexOf(asignar) === -1 ? arrayV.push(asignar) : console.log("Assigned yet")
                arrayV.sort((a: number, b: number) => a - b)
                await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne(
                    { _id: new ObjectId(user_id) },
                    { $set: { asign: arrayV } }
                )
            }
            else if (desasignar !== 0) await dbClient.Client.db(dbClient.dbMW).collection(dbClient.collUsers).updateOne(
                { _id: new ObjectId(user_id) },
                { $pullAll: { asign: [desasignar] } }
            )
            const user: typeUser|null = await this.GetUserById(user_id)
            if (!user) return null
            return user
        } catch (error) {
            console.log("Asign Territory failed:", error)
            return null
        }
    }
}
