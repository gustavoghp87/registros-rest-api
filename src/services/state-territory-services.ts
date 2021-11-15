import { stateOfTerritory } from "../models/territorio"
import { TerritoryDb } from "../services-db/territoryDbConnection"
import { checkAdminByToken, checkAuthByToken, deallocateMyTerritory } from "./user-services"

export const searchStateOfTerritory = async (token: string, territory: string): Promise<stateOfTerritory|null> => {
    if (!await checkAuthByToken(token)) return null
    const obj: stateOfTerritory|null = await new TerritoryDb().SearchStateOfTerritory(territory)
    return obj
}

export const searchStateOfTerritories = async (token: string): Promise<stateOfTerritory[]|null> => {
    if (!await checkAuthByToken(token)) return null
    const obj: stateOfTerritory[]|null = await new TerritoryDb().SearchStateOfTerritories()
    return obj
}

export const changeStateOfTerritory = async (token: string, territory: string, territoryState: boolean): Promise<boolean> => {
    if (!await checkAuthByToken(token)) return false
    let success: boolean = await new TerritoryDb().ChangeStateOfTerritory(territory, territoryState)
    if (success && !await checkAdminByToken(token)) success = await deallocateMyTerritory(token, territory) // if I am not an Admin
    return success
}