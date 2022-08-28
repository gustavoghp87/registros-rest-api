export type typeWeatherResponse = {
    base: string
    clouds: Clouds
    cod: number
    coord: Coord
    dt: number
    id: number
    main: Main
    name: string
    sys: SysWeather
    timezone: number
    visibility: number
    weather: Weather[]
    wind: Wind
}

export type typeForecastResponse = {
    city: City
    cnt: number
    cod: string
    list: List[]
    message: number
}

type Main = {
    feels_like: number
    grnd_level?: number
    humidity: number
    pressure: number
    sea_level?: number
    temp_kf?: number
    temp_max: number
    temp_min: number
    temp: number
}

type Weather = {
    id: number
    main: string
    description: string
    icon: string
}

type Clouds = {
    all: number
}

type Wind = {
    speed: number
    deg: number
    gust?: number
}

type Rain = {
    '3h': number
}

type SysWeather = {
    country: string
    id: number
    sunrise: number
    sunset: number
    type: number
}

type Sys = {
    pod: string
}

type List = {
    dt: number
    main: Main
    weather: Weather[]
    clouds: Clouds
    wind: Wind
    visibility: number
    pop: number
    rain?: Rain
    sys: Sys
    dt_txt: string
}

type Coord = {
    lat: number
    lon: number
}
 
type City = {
    id: number
    name: string
    coord: Coord
    country: string
    population: number
    timezone: number
    sunrise: number
    sunset: number
}
