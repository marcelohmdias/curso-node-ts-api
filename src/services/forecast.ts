/* eslint-disable no-unused-vars */
import { StormGlass, ForecastPoint } from '@src/clients/stormGlass'
import { Beach } from '@src/models/beach'
import { InternalError } from '@src/util/errors/internal-error'

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string
  forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`)
  }
}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = []

    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time)

      if (timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }

    return forecastByTime
  }

  private enrichBeachData(
    points: ForecastPoint[],
    beach: Beach
  ): BeachForecast[] {
    return points.map((point) => {
      return Object.assign(
        {},
        {
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1
        },
        point
      )
    })
  }

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []

    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
        const enrichedBeachData = this.enrichBeachData(points, beach)
        pointsWithCorrectSources.push(...enrichedBeachData)
      }

      return this.mapForecastByTime(pointsWithCorrectSources)
    } catch (err) {
      throw new ForecastProcessingInternalError(err.message)
    }
  }
}
