/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

declare namespace NodeJS {
  interface Global {
    // https://stackoverflow.com/a/51114250
    testRequest: import('supertest').SuperTest<import('supertest').Test>
  }
}
