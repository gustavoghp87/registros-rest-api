import { TerritoryDb } from "./database-services/territoryDbConnection"
import { deallocateMyTerritory } from "./user-services"

export const SearchStateOfTerritory = async (territorio: string) => {
    const obj = await new TerritoryDb().SearchStatesOfTerritories(territorio)
    return obj
}

export const ChangeStateOfTerritory = async (territorio: string, estado: boolean, token: string) => {
    let success = await new TerritoryDb().ChangeStateOfTerritory(territorio, estado)
    if (success) success = await deallocateMyTerritory(territorio, token)
    return success
}
