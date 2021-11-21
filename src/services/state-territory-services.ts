import { stateOfTerritory } from '../models/territorio'
import { TerritoryDb } from '../services-db/territoryDbConnection'
import { deallocateMyTerritory, verifyActivatedAdminByAccessToken, verifyActivatedUserByAccessToken } from './user-services'

export const getStateOfTerritory = async (token: string, territory: string): Promise<stateOfTerritory|null> => {
    if (!await verifyActivatedUserByAccessToken(token)) return null
    const obj: stateOfTerritory|null = await new TerritoryDb().GetStateOfTerritory(territory)
    return obj
}

export const getStateOfTerritories = async (token: string): Promise<stateOfTerritory[]|null> => {
    if (!await verifyActivatedUserByAccessToken(token)) return null
    const obj: stateOfTerritory[]|null = await new TerritoryDb().GetStateOfTerritories()
    return obj
}

export const changeStateOfTerritory = async (token: string, territory: string, territoryState: boolean): Promise<boolean> => {
    if (!await verifyActivatedUserByAccessToken(token)) return false
    console.log("\nTerritory:", territory, "to", territoryState);
    let success: boolean = await new TerritoryDb().ChangeStateOfTerritory(territory, territoryState)
    if (success && !await verifyActivatedAdminByAccessToken(token))
        success = await deallocateMyTerritory(token, territory) // if I am not an Admin
    return success
}
