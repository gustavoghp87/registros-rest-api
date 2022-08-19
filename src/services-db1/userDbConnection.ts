import { ObjectId, UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server1'
import { errorLogs } from '../services1/log-services'
import { typeRecoveryOption, typeUser } from '../models1'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers)

export class UserDb {
    async AddRecoveryOption(email: string, id: string): Promise<boolean> {
        try {
            const user: typeUser|null = await this.GetUserByEmail(email)
            if (!user) return false
            const newRecoveryOption: typeRecoveryOption = {
                id,
                expiration: + new Date() + 24*60*60*1000,       // 24 hs
                used: false
            }
            let recoveryOptions: typeRecoveryOption[]|undefined = user.recoveryOptions
            if (!recoveryOptions) recoveryOptions = []
            recoveryOptions.push(newRecoveryOption)
            const result: UpdateResult = await getCollection().updateOne({ email }, {
                $set: { recoveryOptions }
            })
            return !!result && !!result.modifiedCount
        } catch (error) {
            console.log("Add recovery option failed:", error)
            logger.Add(`Falló AddRecoveryOption() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async AssignCampaignPack(email: string, id: number): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { email },
                { $addToSet: { campaignAssignments: id } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló AssignCampaignPack() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async AssignTLPTerritory(email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> {
        try {
            if (all)
                await getCollection().updateOne(
                    { email },
                    { $set: { phoneAssignments: [] } }
                )
            else if (toAssign)
                await getCollection().updateOne(
                    { email },
                    { $addToSet: { phoneAssignments: toAssign } }
                )
            else if (toUnassign)
                await getCollection().updateOne(
                    { email },
                    { $pull: { phoneAssignments: toUnassign } }
                )
            const user: typeUser|null = await this.GetUserByEmail(email)
            return user ?? null
        } catch (error) {
            console.log("Asign Territory failed:", error)
            logger.Add(`Falló AssignTerritory() ${email} ${toAssign} ${toUnassign} ${all}: ${error}`, errorLogs)
            return null
        }
    }
    async ChangePsw(email: string, encryptedPassword: string): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { email },
                { $set: { password: encryptedPassword } }
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            console.log(error)
            logger.Add(`Falló ChangePsw() ${email}: ${error}`, errorLogs)
            return false
        }
    }
    async EditUserState(email: string, isActive: boolean, role: number, group: number): Promise<typeUser|null> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { email },
                { $set: { isActive, role, group } }
            )
            if (!result.modifiedCount) return null
            const user: typeUser|null = await this.GetUserByEmail(email)
            return user && user.isActive === isActive && user.role === role && user.group === group ? user : null
        } catch (error) {
            console.log("Update User State failed:", error)
            logger.Add(`Falló UpdateUserState() ${email} ${isActive} ${role} ${group}: ${error}`, errorLogs)
            return null
        }
    }
    async GetAllUsers(): Promise<typeUser[]|null> {
        try {
            const users: typeUser[] = await getCollection().find().toArray() as typeUser[]
            return users
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetAllUsers(): ${error}`, errorLogs)
            return null
        }
    }
    async GetUserByEmail(email: string): Promise<typeUser|null> {
        try {
            const user: typeUser|null =
                await getCollection().findOne({ email }) as typeUser
            if (!user) return null
            return user
        } catch (error) {
            console.log("Db user by email", error)
            logger.Add(`Falló GetUserByEmail() ${email}: ${error}`, errorLogs)
            return null
        }
    }
    async GetUserByMongoId(_id: string): Promise<typeUser|null> {   // change to id
        try {
            const user: typeUser|null = await getCollection().findOne({ _id: new ObjectId(_id) }) as typeUser
            if (!user) return null
            return user
        } catch (error) {
            console.log(error)
            logger.Add(`Falló GetUserByMongoId() ${_id}: ${error}`, errorLogs)
            return null
        }
    }
    // async GetUserById(id: number): Promise<typeUser|null> {
    //     try {
    //         const user: typeUser|null = await getCollection().findOne({ id }) as typeUser
    //         return user
    //     } catch (error) {
    //         console.log(error)
    //         logger.Add(`Falló GetUserById() ${id}: ${error}`, errorLogs)
    //         return null
    //     }
    // }
    async RegisterUser(newUser: typeUser): Promise<boolean> {
        try {
            await getCollection().insertOne(newUser as unknown as Document)
            const user: typeUser|null = await this.GetUserByEmail(newUser.email)
            return !!user
        } catch (error) {
            console.log(error)
            logger.Add(`Falló RegisterUser() ${JSON.stringify(newUser)}: ${error}`, errorLogs)
            return false
        }
    }
    async SetRecoveryOptionAsUsed(email: string, id: string): Promise<boolean> {
        try {
            if (!email || !id) throw new Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { email },
                { $set: { 'recoveryOptions.$[x].used': true } },
                { arrayFilters: [{ 'x.id': id }]}
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            console.log("Set recovery option as used failed:", error)
            logger.Add(`Falló SetRecoveryOptionAsUsed() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async UpdateTokenId(_id: string, tokenId: number): Promise<boolean> {   // change to id
        try {
            await getCollection().updateOne(
                { _id: new ObjectId(_id) },
                { $set: { tokenId } }
            )
            const user: typeUser|null = await this.GetUserByMongoId(_id)
            return !!user && user.tokenId === tokenId
        } catch (error) {
            console.log(error)
            logger.Add(`Falló UpdateTokenId() ${_id}: ${error}`, errorLogs)
            return false
        }
    }
}
