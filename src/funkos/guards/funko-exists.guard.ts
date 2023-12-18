import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class FunkoExistsGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return true
  }
}
