import { dbClient, logger } from '../server'
import { ObjectId, UpdateResult } from 'mongodb'
import { generalError } from '../services/log-services';
import { recoveryOption, typeUser } from '../models/user'

export class UserDb {
    async GetUserByEmail(email: string): Promise<typeUser|null> {
        try {
            const user: typeUser|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).findOne({ email }) as typeUser
            if (!user) {console.log("User not found by email in db"); return null}
            if (!user.tokenId) user.tokenId = 1
            return user
        } catch (error) {
            console.log("Db user by email", error)
            logger.Add(`Falló GetUserByEmail() ${email}: ${error}`, generalError)
            return null
        }
    }
    async GetUserById(_id: string): Promise<typeUser|null> {
        try {
            const user: typeUser|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).findOne({ _id: new ObjectId(_id) }) as typeUser
            if (!user) { console.log(`Search user by Id ${_id}: Not found`); return null }
            if (!user.tokenId) user.tokenId = 1
            return user
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetUserById() ${_id}: ${error}`, generalError)
            return null
        }
    }
    async GetUserByEmailLink(id: string): Promise<typeUser|null> {
        try {
            const users: typeUser[]|null = await this.GetAllUsers()
            if (!users) return null
            let user0: typeUser|null = null
            users.forEach((user: typeUser) => {
                if (user && user.recoveryOptions) user.recoveryOptions.forEach((recoveryOption: recoveryOption) => {
                    if (recoveryOption.id === id) user0 = user 
                })
            })
            return user0
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetUserByEmailLink() ${id}: ${error}`, generalError)
            return null
        }
    }
    async GetAllUsers(): Promise<typeUser[]|null> {
        try {
            const users: typeUser[]|null =
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).find().toArray() as typeUser[]
            if (!users) return null
            users.forEach((user: typeUser) => { if (!user.tokenId) user.tokenId === 1; user.password === "" })
            return users
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAllUsers(): ${error}`, generalError)
            return null
        }
    }
    async RegisterUser(newUser: typeUser): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).insertOne(newUser as unknown as Document)
            const user: typeUser|null = await this.GetUserByEmail(newUser.email)
            return !!user
        } catch (error) {
            console.log(error)
            logger.Add(`Falló RegisterUser() ${JSON.stringify(newUser)}: ${error}`, generalError)
            return false
        }
    }
    async UpdateTokenId(_id: string, tokenId: number): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ _id: new ObjectId(_id) }, {
                $set: { tokenId }
            })
            const user: typeUser|null = await this.GetUserById(_id)
            return !!user && user.tokenId === tokenId
        } catch (error) {
            console.log(error)
            logger.Add(`Falló UpdateTokenId() ${_id}: ${error}`, generalError)
            return false
        }
    }
    async ChangeMode(email: string, darkMode: boolean): Promise<boolean> {
        try {
            await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ email }, {
                $set: { darkMode }
            })
            const user: typeUser|null = await this.GetUserByEmail(email)
            return !!user && user.darkMode === darkMode
        } catch (error) {
            console.log(error)
            logger.Add(`Falló ChangeMode() ${email} ${darkMode}: ${error}`, generalError)
            return false
        }
    }
    async ChangePsw(email: string, encryptedPassword: string): Promise<boolean> {
        try {
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne(
                { email },
                { $set: { password: encryptedPassword } }
            )
            const user: typeUser|null = await this.GetUserByEmail(email)
            return !!user && user.password === encryptedPassword
        } catch (error) {
            console.log(error)
            logger.Add(`Falló ChangePsw() ${email}: ${error}`, generalError)
            return false
        }
    }
    async UpdateUserState(user_id: string, estado: boolean, role: number, group: number): Promise<typeUser|null> {
        try {
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne(
                { _id: new ObjectId(user_id) },
                { $set: { estado, role, group } }
            )
            const user: typeUser|null = await this.GetUserById(user_id)
            return user && user.estado === estado && user.role === role && user.group === group ? user : null
        } catch (error) {
            console.log("Update User State failed:", error)
            logger.Add(`Falló UpdateUserState() ${user_id} ${estado} ${role} ${group}: ${error}`, generalError)
            return null
        }
    }
    async AssignTerritory(user_id: string, asignar: number, desasignar: number, all: boolean): Promise<typeUser|null> {
        try {
            if (all)
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ _id: new ObjectId(user_id) }, {
                    $set: { asign: [] }
                })
            else if (asignar && asignar !== 0) {
                const userToMod: typeUser|null = await this.GetUserById(user_id)
                if (!userToMod) return null
                let arrayV: number[] = userToMod.asign || []
                arrayV.indexOf(asignar) === -1 ? arrayV.push(asignar) : console.log("Assigned yet")
                arrayV.sort((a: number, b: number) => a - b)
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne( { _id: new ObjectId(user_id) }, {
                    $set: { asign: arrayV }
                })
            }
            else if (desasignar && desasignar !== 0)
                await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ _id: new ObjectId(user_id) }, {
                    $pullAll: { asign: [desasignar] }
                })
            const user: typeUser|null = await this.GetUserById(user_id)
            return user ? user : null
        } catch (error) {
            console.log("Asign Territory failed:", error)
            logger.Add(`Falló AssignTerritory() ${user_id} ${asignar} ${desasignar} ${all}: ${error}`, generalError)
            return null
        }
    }
    async AddRecoveryOption(email: string, id: string): Promise<boolean> {
        try {
            const user: typeUser|null = await this.GetUserByEmail(email)
            if (!user) return false
            const newRecoveryOption: recoveryOption = {
                id,
                expiration: + new Date() + 24*60*60*1000,       // 24 hs
                used: false
            }
            let recoveryOptions: recoveryOption[]|undefined = user.recoveryOptions
            if (!recoveryOptions) recoveryOptions = []
            recoveryOptions.push(newRecoveryOption)
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ email }, {
                $set: { recoveryOptions }
            })
            return true
        } catch (error) {
            console.log("Add recovery option failed:", error)
            logger.Add(`Falló AddRecoveryOption() ${email} ${id}: ${error}`, generalError)
            return false
        }
    }
    async SetRecoveryOptionAsUsed(user: typeUser, id: string): Promise<boolean> {
        try {
            if (!id || !user || !user.recoveryOptions || !user.email) return false
            user.recoveryOptions?.forEach((recoveryOption: recoveryOption) => {
                if (recoveryOption.id === id) recoveryOption.used = true
            })
            const result: UpdateResult = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers).updateOne({ email: user.email }, {
                $set: { recoveryOptions: user.recoveryOptions }
            })
            return true
        } catch (error) {
            console.log("Set recovery option as used failed:", error)
            logger.Add(`Falló SetRecoveryOptionAsUsed() ${JSON.stringify(user)} ${id}: ${error}`, generalError)
            return false
        }
    }
}
