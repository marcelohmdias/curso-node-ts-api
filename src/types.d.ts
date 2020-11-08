import * as http from 'http'

import { DecodedUser } from '@src/services/auth'

// module augmentation
declare module 'express-serve-static-core' {
  // eslint-disable-next-line no-undef
  export interface Request extends http.IncomingMessage, Express.Request {
    decoded?: DecodedUser
  }
}
