import { UpdateResult } from 'mongodb'
import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeCallingState, typeHousehold, typeTelephonicTerritory, typeTerritoryNumber } from '../models'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTelephonicTerritories)

export class TelephonicDb {

    private noPredicado: typeCallingState = 'No predicado'
    
    async ChangeStateOfTerritory(territoryNumber: string, isFinished: boolean): Promise<boolean> {
        try {
            if (!territoryNumber) throw new Error("No llegó el territorio")
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: { 'stateOfTerritory.isFinished': isFinished } }
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló ChangeStateOfTerritory() pasando ${territoryNumber} a ${isFinished}: ${error}`, errorLogs)
            return false
        }
    }
    async GetAllTelephonicTerritories(): Promise<typeTelephonicTerritory[]|null> {
        try {
            const phoneTerritories = await getCollection().find().toArray() as unknown as typeTelephonicTerritory[]
            return phoneTerritories
        } catch (error) {
            logger.Add(`Falló GetAllHouseholds(): ${error}`, errorLogs)
            return null
        }
    }
    async GetHouseholdById(territoryNumber: typeTerritoryNumber, householdId: number): Promise<typeHousehold|null> {
        try {
            const telephonicTerritory = await getCollection().findOne(
                { territoryNumber }
            ) as unknown as typeTelephonicTerritory
            return telephonicTerritory.households.find(x => x.householdId === householdId) || null    // ...
        } catch (error) {
            logger.Add(`Falló GetHouseholdById(): ${error}`, errorLogs)
            return null
        }
    }
    async GetTerritory(territoryNumber: string): Promise<typeTelephonicTerritory|null> {
        try {
            const telephonicTerritory = await getCollection().findOne({ territoryNumber }) as unknown as typeTelephonicTerritory
            return telephonicTerritory
        } catch (error) {
            logger.Add(`Falló GetTerritory() territorio ${territoryNumber}: ${error}`, errorLogs)
            return null
        }
    }
    async ResetTerritory(territoryNumber: string, option: number): Promise<number|null> {
        const sixMonthsInMilliseconds = Date.now() - 15778458000
        try {
            let result: UpdateResult|null
            if (option === 1) {
                console.log("Option 1 // clean all except 'notSubscribed', more than 6 months")
                result = await getCollection().updateOne(
                    { territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } },
                    { arrayFilters: [{ 'x.notSubscribed': false, 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] }
                )
            } else if (option === 2) {
                console.log("Option 2  // clean all except 'notSubscribed'")
                result = await getCollection().updateOne(
                    { territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } },
                    { arrayFilters: [{ 'x.notSubscribed': false }] }
                )
            } else if (option === 3) {
                console.log("Option 3  // clean more than 6 months even 'notSubscribed'")
                result = await getCollection().updateOne(
                    { territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false, 'households.$[x].notSubscribed': false } },
                    { arrayFilters: [{ 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] }
                )
            } else if (option === 4) {
                console.log("Option 4  // clean all even 'notSubscribed'")
                result = await getCollection().updateOne(
                    { territoryNumber },
                    { $set: { 'households.$[].callingState': this.noPredicado, 'households.$[].isAssigned': false, 'households.$[].notSubscribed': false } }
                )
            } else {
                result = null
            }
            return result ? result.modifiedCount : null
        } catch (error) {
            logger.Add(`Falló ResetTerritory() territorio ${territoryNumber} opción ${option}: ${error}`, errorLogs)
            return null
        }
    }
    async SetResetDate(territoryNumber: string, option: number): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $push: { 'stateOfTerritory.resetDates': { date: +new Date(), option } } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló SetResetDate() pasando ${territoryNumber} opción ${option}: ${error}`, errorLogs)
            return false
        }
    }
    async UpdateHouseholdState(territoryNumber: typeTerritoryNumber, householdId: number, callingState: typeCallingState, notSubscribed: boolean, isAssigned: boolean): Promise<boolean> {
        try {
            const result: UpdateResult = await getCollection().updateOne(
                { territoryNumber },
                { $set: {
                    'households.$[x].callingState': callingState,
                    'households.$[x].notSubscribed': notSubscribed,
                    'households.$[x].isAssigned': isAssigned,
                    'households.$[x].dateOfLastCall': Date.now()
                } },
                { arrayFilters: [{ 'x.householdId': householdId }] }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(`Falló UpdateHouseholdState() pasando ${householdId} ${callingState} ${notSubscribed} ${isAssigned}: ${error}`, errorLogs)
            return false
        }
    }
}
