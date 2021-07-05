import { TerritoryDb } from "./database-services/territoryDbConnection"
import { checkAdminByToken, checkAuthByToken, deallocateMyTerritory } from "./user-services"

export const SearchStateOfTerritory = async (territorio: string, token: string) => {
    if (!await checkAuthByToken(token)) return null
    const obj = await new TerritoryDb().SearchStateOfTerritory(territorio)
    return obj
}

export const SearchStateOfTerritories = async (token: string) => {
    if (!await checkAuthByToken(token)) return null
    const obj = await new TerritoryDb().SearchStateOfTerritories()
    return obj
}

export const ChangeStateOfTerritory = async (territorio: string, estado: boolean, token: string) => {
    if (!await checkAuthByToken(token)) return false
    let success = await new TerritoryDb().ChangeStateOfTerritory(territorio, estado)
    if (success && !await checkAdminByToken(token)) success = await deallocateMyTerritory(territorio, token)
    return success
}
