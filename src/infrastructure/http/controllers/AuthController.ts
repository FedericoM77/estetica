import type { LoginUseCase } from '../../../use-cases/auth/LoginUseCase'
import { ApplicationError } from '../../../use-cases/auth/AuthTypes'
import type { HttpRequest, HttpResponse } from '../HttpTypes'
import { json } from '../HttpTypes'

interface LoginBody {
  email?: unknown
  password?: unknown
}

function parseLoginBody(body: unknown): { email: string; password: string } {
  const candidate = body as LoginBody | undefined

  if (
    !candidate ||
    typeof candidate.email !== 'string' ||
    typeof candidate.password !== 'string'
  ) {
    throw new ApplicationError(401, 'INVALID_CREDENTIALS', 'Email o contrasena invalidos.')
  }

  return {
    email: candidate.email,
    password: candidate.password,
  }
}

export class AuthController {
  private readonly loginUseCase: LoginUseCase

  constructor(loginUseCase: LoginUseCase) {
    this.loginUseCase = loginUseCase
  }

  async login(request: HttpRequest): Promise<HttpResponse> {
    try {
      const input = parseLoginBody(request.body)
      const result = await this.loginUseCase.execute(input)
      return json(200, result)
    } catch (error) {
      if (error instanceof ApplicationError) {
        return json(error.statusCode, { error: error.code })
      }

      return json(500, { error: 'INTERNAL_SERVER_ERROR' })
    }
  }
}
