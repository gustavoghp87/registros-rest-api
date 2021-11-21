import { stateOfTerritory } from "../models/territorio"
import { TerritoryDb } from "../services-db/territoryDbConnection"
import { deallocateMyTerritory, verifyActivatedAdminByAccessToken, verifyActivatedUserByAccessToken } from "./user-services"

export const searchStateOfTerritory = async (token: string, territory: string): Promise<stateOfTerritory|null> => {
    if (!await verifyActivatedUserByAccessToken(token)) return null
    const obj: stateOfTerritory|null = await new TerritoryDb().SearchStateOfTerritory(territory)
    return obj
}

export const searchStateOfTerritories = async (token: string): Promise<stateOfTerritory[]|null> => {
    if (!await verifyActivatedUserByAccessToken(token)) return null
    const obj: stateOfTerritory[]|null = await new TerritoryDb().SearchStateOfTerritories()
    return obj
}

export const changeStateOfTerritory = async (token: string, territory: string, territoryState: boolean): Promise<boolean> => {
    if (!await verifyActivatedUserByAccessToken(token)) return false
    console.log("4444444444444444444444444444444444444444444444444444444444444444444");
    
    let success: boolean = await new TerritoryDb().ChangeStateOfTerritory(territory, territoryState)
    console.log("555555555555555555555555555555555555555555555555555555555555555555555", success);
    
    if (success && !await verifyActivatedAdminByAccessToken(token)) success = await deallocateMyTerritory(token, territory) // if I am not an Admin
    return success
}
