import { Response } from 'express'
import { Error } from 'mongoose'

import { CUSTOM_VALIDATION } from '@src/models/user'

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: Error.ValidationError | Error
  ): void {
    if (error instanceof Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error)

      res.status(clientErrors.code).send({
        code: clientErrors.code,
        error: clientErrors.error
      })
    } else {
      res.status(500).send({
        code: 500,
        error: 'Something went wrong!'
      })
    }
  }

  private handleClientErrors(
    error: Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    )

    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message }
    }

    return { code: 422, error: error.message }
  }
}
