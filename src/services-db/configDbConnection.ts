import { dbClient, invitationNewUserExpiresIn, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { getCurrentLocalDate } from '../services/helpers'
import { InsertOneResult, UpdateResult } from 'mongodb'
import { typeConfig, typeInvitarionNewUser } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollConfig)

export class ConfigDb {
    async Genesys(congregation: number): Promise<boolean> {
        try {
            if (!congregation || !Number.isInteger(congregation)) throw Error("Faltan datos")
            const config: typeConfig = {
                congregation,
                date: Date.now(),
                dbBackupLastDate: '',
                googleBoardUrl: '',
                invitations: [],
                isDisabledCloseHthFaces: true,
                isDisabledEditHthMaps: false,
                isDisabledHthBuildingsForUnassignedUsers: true,
                isDisabledHthFaceObservations: true,
                name: "",
                numberOfTerritories: 0,
                usingLettersForBlocks: false
            }
            const result: InsertOneResult = await getCollection().insertOne(config)
            console.log("Config Genesys:", result.insertedId)
            return !!result.insertedId
        } catch (error) {
            logger.Add(1, `Falló Config Genesys(): ${error}`, errorLogs)
            return false
        }
    }
    async GetConfig(congregation: number): Promise<typeConfig|null> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const config = await getCollection().findOne({ congregation }) as unknown as typeConfig
            return config
        } catch (error) {
            logger.Add(1, `Falló GetConfig() (${congregation}): ${error}`, errorLogs)
            return null
        }
    }
    async GetMaxCongregationNumber(): Promise<number|null> {
        try {
            const result = await dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollConfig).aggregate([{
                $group: { _id: null, maxCongr: { $max: "$congregation" } }
            }]).toArray() as { _id: any, maxCongr: number }[]
            const maxCongregationNumber = result[0].maxCongr
            return maxCongregationNumber
        } catch (error) {
            logger.Add(1, `Falló GetMaxCongregationNumber(): ${error}`, errorLogs)
            return null
        }
    }
    async SaveNewUserInvitation(userId: number, congregation: number, email: string, id: string, isNewCongregation: boolean = false) {
        try {
            if (!userId || !congregation || !email) throw Error("Faltan datos")
            const invitation: typeInvitarionNewUser = {
                email,
                expire: Date.now() + invitationNewUserExpiresIn,
                id,
                inviting: userId,
                isNewCongregation
            }
            const result: UpdateResult = await getCollection().updateOne(
                { congregation: isNewCongregation ? 1 : congregation },
                { $addToSet: { invitations: invitation } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SaveNewUserInvitation() (${email}, ${userId}): ${error}`, errorLogs)
            return false
        }
    }
    async SetDbBackupLastDate(congregation: number): Promise<boolean> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { dbBackupLastDate: getCurrentLocalDate() } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetDbBackupLastDate(): ${error}`, errorLogs)
            return false
        }
    }
    async SetDisableCloseHthFaces(congregation: number, disableCloseHthFaces: boolean): Promise<boolean> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { isDisabledCloseHthFaces: !!disableCloseHthFaces } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetDisableCloseHthFaces() (${disableCloseHthFaces}): ${error}`, errorLogs)
            return false
        }
    }
    async SetDisableEditHthMaps(congregation: number, disableEditHthMaps: boolean): Promise<boolean> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { isDisabledEditHthMaps: !!disableEditHthMaps } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetDisableEditHthMaps() (${disableEditHthMaps}): ${error}`, errorLogs)
            return false
        }
    }
    async SetDisableHthBuildingsForUnassignedUsers(congregation: number, disableHthBuildingsForUnassignedUsers: boolean): Promise<boolean> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { isDisabledHthBuildingsForUnassignedUsers: !!disableHthBuildingsForUnassignedUsers } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetDisableHthBuildingsForUnassignedUsers() (${disableHthBuildingsForUnassignedUsers}): ${error}`, errorLogs)
            return false
        }
    }
    async SetDisableHthFaceObservatios(congregation: number, disableHthFaceObservations: boolean): Promise<boolean> {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { isDisabledHthFaceObservations: !!disableHthFaceObservations } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetDisableHthFaceObservatios() (${disableHthFaceObservations}): ${error}`, errorLogs)
            return false
        }
    }
    async SetNameOfCongregation(congregation: number, name: string): Promise<boolean> {
        try {
            if (!congregation || !name || name.length < 6) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { name } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetNameOfCongregation() (${name}): ${error}`, errorLogs)
            return false
        }
    }
    async SetNumberOfTerritories(congregation: number, numberOfTerritories: number): Promise<boolean> {
        try {
            if (!congregation || !numberOfTerritories || !Number.isInteger(numberOfTerritories)) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { numberOfTerritories } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetNumberOfTerritories() (${numberOfTerritories}): ${error}`, errorLogs)
            return false
        }
    }
    async SetGoogleBoardUrl(congregation: number, googleBoardUrl: string): Promise<boolean> {
        try {
            if (!congregation || !googleBoardUrl) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { googleBoardUrl } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetGoogleBoardUrl() (${googleBoardUrl}): ${error}`, errorLogs)
            return false
        }
    }
    async SetUseLettersForBlocksService(congregation: number, useLettersForBlocks: boolean) {
        try {
            if (!congregation) throw Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation },
                { $set: { usingLettersForBlocks: !!useLettersForBlocks } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetUseLettersForBlocksService() (${useLettersForBlocks}): ${error}`, errorLogs)
            return false
        }
    }
}
