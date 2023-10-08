import { dbClient, logger } from '../server'
import { errorLogs } from '../services/log-services'
import { typeCallingState, typeHousehold, typeTelephonicTerritory, typeTerritoryNumber } from '../models'
import { UpdateResult } from 'mongodb'

const getCollection = () => dbClient.Client.db(dbClient.DbMW).collection(dbClient.CollTelephonicTerritories)

export class TelephonicDb {

    private noPredicado: typeCallingState = 'No predicado'
    
    async ChangeStateOfTerritory(congregation: number, territoryNumber: string, isFinished: boolean): Promise<boolean> {
        try {
            if (!congregation || !territoryNumber) throw new Error("Faltan datos")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $set: { 'stateOfTerritory.isFinished': isFinished } }
            )
            return !!result && !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló ChangeStateOfTerritory() pasando ${territoryNumber} a ${isFinished}: ${error}`, errorLogs)
            return false
        }
    }
    async GetAllTelephonicTerritories(congregation: number): Promise<typeTelephonicTerritory[]|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const phoneTerritories = await getCollection().find({ congregation }).toArray() as unknown as typeTelephonicTerritory[]
            return phoneTerritories
        } catch (error) {
            logger.Add(congregation, `Falló GetAllHouseholds(): ${error}`, errorLogs)
            return null
        }
    }
    async GetHouseholdById(congregation: number, territoryNumber: typeTerritoryNumber, householdId: number): Promise<typeHousehold|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const telephonicTerritory = await getCollection().findOne(
                { congregation, territoryNumber }
            ) as unknown as typeTelephonicTerritory
            return telephonicTerritory.households.find(x => x.householdId === householdId) || null    // ...
        } catch (error) {
            logger.Add(congregation, `Falló GetHouseholdById(): ${error}`, errorLogs)
            return null
        }
    }
    async GetTerritory(congregation: number, territoryNumber: string): Promise<typeTelephonicTerritory|null> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const telephonicTerritory = await getCollection().findOne({ congregation, territoryNumber }) as unknown as typeTelephonicTerritory
            return telephonicTerritory
        } catch (error) {
            logger.Add(congregation, `Falló GetTerritory() territorio ${territoryNumber}: ${error}`, errorLogs)
            return null
        }
    }
    async ResetTerritory(congregation: number, territoryNumber: string, option: number): Promise<number|null> {
        const sixMonthsInMilliseconds = Date.now() - 15778458000
        try {
            if (!congregation) throw new Error("No llegó congregación")
            let result: UpdateResult|null
            if (option === 1) {
                console.log("Option 1 // clean all except 'notSubscribed', more than 6 months")
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } },
                    { arrayFilters: [{ 'x.notSubscribed': false, 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] }
                )
            } else if (option === 2) {
                console.log("Option 2  // clean all except 'notSubscribed'")
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false } },
                    { arrayFilters: [{ 'x.notSubscribed': false }] }
                )
            } else if (option === 3) {
                console.log("Option 3  // clean more than 6 months even 'notSubscribed'")
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    { $set: { 'households.$[x].callingState': this.noPredicado, 'households.$[x].isAssigned': false, 'households.$[x].notSubscribed': false } },
                    { arrayFilters: [{ 'x.dateOfLastCall': { $lt: sixMonthsInMilliseconds } }] }
                )
            } else if (option === 4) {
                console.log("Option 4  // clean all even 'notSubscribed'")
                result = await getCollection().updateOne(
                    { congregation, territoryNumber },
                    { $set: { 'households.$[].callingState': this.noPredicado, 'households.$[].isAssigned': false, 'households.$[].notSubscribed': false } }
                )
            } else {
                result = null
            }
            return result ? result.modifiedCount : null
        } catch (error) {
            logger.Add(congregation, `Falló ResetTerritory() territorio ${territoryNumber} opción ${option}: ${error}`, errorLogs)
            return null
        }
    }
    async SetResetDate(congregation: number, territoryNumber: string, option: number): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
                { $push: { 'stateOfTerritory.resetDates': { date: Date.now(), option } } }
            )
            return !!result.modifiedCount
        } catch (error) {
            logger.Add(congregation, `Falló SetResetDate() pasando ${territoryNumber} opción ${option}: ${error}`, errorLogs)
            return false
        }
    }
    async UpdateHouseholdState(congregation: number, territoryNumber: typeTerritoryNumber,
     householdId: number, callingState: typeCallingState, notSubscribed: boolean, isAssigned: boolean): Promise<boolean> {
        try {
            if (!congregation) throw new Error("No llegó congregación")
            const result: UpdateResult = await getCollection().updateOne(
                { congregation, territoryNumber },
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
            logger.Add(congregation, `Falló UpdateHouseholdState() pasando ${householdId} ${callingState} ${notSubscribed} ${isAssigned}: ${error}`, errorLogs)
            return false
        }
    }
}
