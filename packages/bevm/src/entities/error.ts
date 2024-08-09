import { ResponseError } from '@/request/axios'

export class OBridgeError extends Error {
  code: string
  rawError: Error

  constructor (message: string, rawError: Error, code?: string) {
    super(message)
    this.name = 'OBridgeError'
    if (rawError instanceof ResponseError) {
      this.code = 'O_RESPONSE_ERROR'
    } else {
      // @ts-expect-error Some errors has error code so we reuse it directly.
      this.code = code ?? rawError.code ?? 'UNKNOWN_ERROR'
    }
    this.rawError = rawError
  }
}
