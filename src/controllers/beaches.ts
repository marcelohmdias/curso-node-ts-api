import { Controller, Post } from '@overnightjs/core'
import { Request, Response } from 'express'
import { Error } from 'mongoose'

import { Beach } from '@src/models/beach'

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body)
      const result = await beach.save()

      res.status(201).send(result)
    } catch (error) {
      if (error instanceof Error.ValidationError) {
        res.status(422).send({ error: error.message })
      } else {
        res.status(500).send({ error: 'Internal Server Error' })
      }
    }
  }
}
