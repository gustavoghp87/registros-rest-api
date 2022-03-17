export type typeLog = {
    timestamp: number
    logText: string
}

export type typeLogsObj = {
    loginLogs: typeLog[]
    campaignAssignmentLogs: typeLog[]
    campaignFinishingLogs: typeLog[]
    territoryChangeLogs: typeLog[]
    stateOfTerritoryChangeLogs: typeLog[]
    errorLogs: typeLog[]
    userChanges: typeLog[]
}
