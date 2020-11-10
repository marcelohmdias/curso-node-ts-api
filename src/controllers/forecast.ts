import { ClassMiddleware, Controller, Get } from '@overnightjs/core'
import { Request, Response } from 'express'

import { authMiddleware } from '@src/middlewares/auth'
import { Beach } from '@src/models/beach'
import { Forecast } from '@src/services/forecast'

const forecast = new Forecast()

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  @Get('')
  public async getForecastForgeLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({})

      const forecastData = await forecast.processForecastForBeaches(beaches)

      res.status(200).send(forecastData)
    } catch (err) {
      res.status(500).send({ error: 'Something went wrong' })
    }
  }
}
