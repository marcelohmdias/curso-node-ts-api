import './util/module-alias'

import { Server } from '@overnightjs/core'
import bodyParser from 'body-parser'
import { Application } from 'express'

import { BeachesController } from '@src/controllers/beaches'
import { ForecastController } from '@src/controllers/forecast'
import { UsersController } from '@src/controllers/users'
import * as database from '@src/database'

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super()
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json())
    this.setupControllers()
  }

  private setupControllers(): void {
    this.addControllers([
      new BeachesController(),
      new ForecastController(),
      new UsersController()
    ])
  }

  private async databaseSetup(): Promise<void> {
    await database.connect()
  }

  public async close(): Promise<void> {
    await database.close()
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info('Server listening on port: ' + this.port)
    })
  }

  public async init(): Promise<void> {
    this.setupExpress()
    this.setupControllers()
    await this.databaseSetup()
  }

  public getApp(): Application {
    return this.app
  }
}
