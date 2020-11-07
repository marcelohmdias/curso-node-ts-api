import config, { IConfig } from 'config'

import { InternalError } from '@src/util/errors/internal-error'
import * as HTTPUtil from '@src/util/request'

export interface StormGlassPointSource {
  [key: string]: number
}

export interface StormGlassPoint {
  time: string
  readonly waveHeight: StormGlassPointSource
  readonly waveDirection: StormGlassPointSource
  readonly swellDirection: StormGlassPointSource
  readonly swellHeight: StormGlassPointSource
  readonly swellPeriod: StormGlassPointSource
  readonly windDirection: StormGlassPointSource
  readonly windSpeed: StormGlassPointSource
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[]
}

export interface ForecastPoint {
  time: string
  waveHeight: number
  waveDirection: number
  swellDirection: number
  swellHeight: number
  swellPeriod: number
  windDirection: number
  windSpeed: number
}

/**
 * We could have proper type for the configuration
 */
const resourceConfig: IConfig = config.get('App.resources.StormGlass')

/**
 * This error type is used when a request reaches out to the StormGlass API but returns an error
 */
export class StormGlassUnexpectedResponseError extends InternalError {
  constructor(message: string) {
    super(message)
  }
}

/**
 * This error type is used when something breaks before the request reaches out to the StormGlass API
 * eg: Network error, or request validation error
 */
export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass'
    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service'
    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlass {
  readonly urlBase = `${resourceConfig.get('apiUrl')}/weather/point`
  readonly apiSource = 'noaa'
  readonly apiParams = [
    'swellDirection',
    'swellHeight',
    'swellPeriod',
    'waveDirection',
    'waveHeight',
    'windDirection',
    'windSpeed'
  ].join('')

  constructor(protected request = new HTTPUtil.Request()) {}

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.apiSource] &&
      point.swellHeight?.[this.apiSource] &&
      point.swellPeriod?.[this.apiSource] &&
      point.waveDirection?.[this.apiSource] &&
      point.waveHeight?.[this.apiSource] &&
      point.windDirection?.[this.apiSource] &&
      point.windSpeed?.[this.apiSource]
    )
  }

  private mapForecastPoint(point: StormGlassPoint): ForecastPoint {
    return {
      swellDirection: point.swellDirection[this.apiSource],
      swellHeight: point.swellHeight[this.apiSource],
      swellPeriod: point.swellPeriod[this.apiSource],
      time: point.time,
      waveDirection: point.waveDirection[this.apiSource],
      waveHeight: point.waveHeight[this.apiSource],
      windDirection: point.windDirection[this.apiSource],
      windSpeed: point.windSpeed[this.apiSource]
    }
  }

  private normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours
      .filter(this.isValidPoint.bind(this))
      .map(this.mapForecastPoint.bind(this))
  }

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const url = `${this.urlBase}?lat=${lat}&&lng=${lng}&params=${this.apiParams}&source=${this.apiSource}`

      const response = await this.request.get<StormGlassForecastResponse>(url, {
        headers: {
          Authorization: resourceConfig.get('apiToken')
        }
      })

      return this.normalizeResponse(response.data)
    } catch (err) {
      /**
       * This is handling the Axios errors specifically
       */
      if (HTTPUtil.Request.isRequestError(err)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${
            err.response.status
          }`
        )
      }

      throw new ClientRequestError(err.message)
    }
  }
}
