export type typeLogObj = {
    timestamp: number
    logText: string
}

export type typeLogsObj = {
    loginLogs: typeLogObj[]
    campaignAssignmentLogs: typeLogObj[]
    campaignFinishingLogs: typeLogObj[]
    territoryChangeLogs: typeLogObj[]
    stateOfTerritoryChangeLogs: typeLogObj[]
    emailErrorLogs: typeLogObj[]
    errorLogs: typeLogObj[]
    userChangesLogs: typeLogObj[]
    appLogs: typeLogObj[]
}
