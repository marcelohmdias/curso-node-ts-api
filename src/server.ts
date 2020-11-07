import './util/module-alias'

import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application } from 'express'

import { ForecastController } from './controllers/forecast'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super()
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
    this.setupControllers()
  }

  private setupControllers(): void {
    this.addControllers(new ForecastController())
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.setupControllers()
  }

  public getApp(): Application {
    return this.app
  }
}
