import { dbClient, logger } from '../server'
import { DeleteResult, UpdateResult } from 'mongodb'
import { errorLogs } from '../services/log-services'
import { typeRecoveryOption, typeUser } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollUsers)

export class UserDb {
    async AddRecoveryOption(congregation: number, email: string, id: string): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const user: typeUser|null = await this.GetUserByEmail(congregation, email)
            if (!user) return false
            const newRecoveryOption: typeRecoveryOption = {
                id,
                expiration: + new Date() + 24*60*60*1000,       // 24 hs
                used: false
            }
            let recoveryOptions: typeRecoveryOption[]|undefined = user.recoveryOptions
            if (!recoveryOptions) recoveryOptions = []
            recoveryOptions.push(newRecoveryOption)
            const result: UpdateResult = await getCollection().updateOne({ congregation, email }, {
                $set: { recoveryOptions }
            })
            return !!result && !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AddRecoveryOption() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async AssignCampaignPack(congregation: number, email: string, id: number): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, email },
                { $addToSet: { campaignAssignments: id } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló AssignCampaignPack() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async AssignHTHTerritory(congregation: number, email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            let result: UpdateResult
            if (all)
                result = await getCollection().updateOne(
                    { congregation, email },
                    { $set: { hthAssignments: [] } }
                )
            else if (toAssign)
                result = await getCollection().updateOne(
                    { congregation, email },
                    { $addToSet: { hthAssignments: toAssign } }
                )
            else if (toUnassign)
                result = await getCollection().updateOne(
                    { congregation, email },
                    { $pull: { hthAssignments: toUnassign } }
                )
            else return null
            if (!result || !result.modifiedCount) return null
            const user: typeUser|null = await this.GetUserByEmail(congregation, email)
            return user ?? null
        } catch (error) {
            logger.Add(congregation, `Falló AssignTerritory() ${email} ${toAssign} ${toUnassign} ${all}: ${error}`, errorLogs)
            return null
        }
    }
    async AssignTLPTerritory(congregation: number, email: string, toAssign: number, toUnassign: number, all: boolean): Promise<typeUser|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            if (all)
                await getCollection().updateOne(
                    { congregation, email },
                    { $set: { phoneAssignments: [] } }
                )
            else if (toAssign)
                await getCollection().updateOne(
                    { congregation, email },
                    { $addToSet: { phoneAssignments: toAssign } }
                )
            else if (toUnassign)
                await getCollection().updateOne(
                    { congregation, email },
                    { $pull: { phoneAssignments: toUnassign } }
                )
            const user: typeUser|null = await this.GetUserByEmail(congregation, email)
            return user ?? null
        } catch (error) {
            logger.Add(congregation, `Falló AssignTerritory() ${email} ${toAssign} ${toUnassign} ${all}: ${error}`, errorLogs)
            return null
        }
    }
    async ChangePsw(congregation: number, email: string, encryptedPassword: string): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, email },
                { $set: { password: encryptedPassword } }
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló ChangePsw() ${email}: ${error}`, errorLogs)
            return false
        }
    }
    async DeleteUser(congregation: number, id: number): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            if (!id) return false
            const result: DeleteResult = await getCollection().deleteOne({ congregation, id })
            return !!result.deletedCount
        } catch (error) {
            logger.Add(congregation, `Falló DeleteUser() ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async EditUserState(congregation: number, email: string, isActive: boolean, role: number, group: number): Promise<typeUser|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, email },
                { $set: { isActive, role, group } }
            )
            if (!result.modifiedCount) return null
            const user: typeUser|null = await this.GetUserByEmail(congregation, email)
            return user && user.isActive === isActive && user.role === role && user.group === group ? user : null
        } catch (error) {
            logger.Add(congregation, `Falló UpdateUserState() ${email} ${isActive} ${role} ${group}: ${error}`, errorLogs)
            return null
        }
    }
    async GetAllUsers(congregation: number): Promise<typeUser[]|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const users: typeUser[] = await getCollection().find({ congregation }).toArray() as unknown as typeUser[]
            return users
        } catch (error) {
            logger.Add(congregation, `Falló GetAllUsers(): ${error}`, errorLogs)
            return null
        }
    }
    async GetUserByEmail(congregation: number, email: string): Promise<typeUser|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            if (!email) throw new Error("No llegó email")
            const user = await getCollection().findOne({ congregation, email }) as unknown as typeUser|null
            return user
        } catch (error) {
            logger.Add(congregation, `Falló GetUserByEmail() ${email}: ${error}`, errorLogs)
            return null
        }
    }
    async GetUserByEmailEveryCongregation(email: string): Promise<typeUser|null> {
        try {
            if (!email) throw new Error("No llegó congregación")
            const user = await getCollection().findOne({ email }) as unknown as typeUser|null
            return user
        } catch (error) {
            logger.Add(1, `Falló GetUserByEmailEveryCongregation() ${email}: ${error}`, errorLogs)
            return null
        }
    }
    async GetUserById(congregation: number, id: number): Promise<typeUser|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const user: typeUser|null = await getCollection().findOne({ congregation, id }) as unknown as typeUser
            return user
        } catch (error) {
            logger.Add(congregation, `Falló GetUserById() ${id}: ${error}`, errorLogs)
            return null
        }
    }
    async RegisterUser(congregation: number, newUser: typeUser): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            await getCollection().insertOne(newUser as unknown as Document)
            const user: typeUser|null = await this.GetUserByEmail(congregation, newUser.email)
            return !!user
        } catch (error) {
            logger.Add(congregation, `Falló RegisterUser() ${JSON.stringify(newUser)}: ${error}`, errorLogs)
            return false
        }
    }
    async SetRecoveryOptionAsUsed(congregation: number, email: string, id: string): Promise<boolean> {
        try {
            if (!congregation || !email || !id) throw new Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, email },
                { $set: { 'recoveryOptions.$[x].used': true } },
                { arrayFilters: [{ 'x.id': id }]}
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetRecoveryOptionAsUsed() ${email} ${id}: ${error}`, errorLogs)
            return false
        }
    }
    async UpdateTokenId(congregation: number, id: number, tokenId: number): Promise<boolean> {   // change to id
        try {
            if (!congregation) throw new Error("No llegó congregación")
            await getCollection().updateOne(
                { congregation, id },
                { $set: { tokenId } }
            )
            const user: typeUser|null = await this.GetUserById(congregation, id)
            return !!user && user.tokenId === tokenId
        } catch (error) {
            logger.Add(congregation, `Falló UpdateTokenId() ${id}: ${error}`, errorLogs)
            return false
        }
    }
}
