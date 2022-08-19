const getRandomCharacter = (i: number): string => Math.random().toString(36).slice(i * -1)

export const getRandomId24 = (): string => getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4) + "-" + getRandomCharacter(4)

export const getRandomId12 = (): string => getRandomCharacter(3) + "-" + getRandomCharacter(3) + "-" + getRandomCharacter(4)
