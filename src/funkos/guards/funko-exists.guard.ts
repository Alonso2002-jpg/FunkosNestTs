import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { FunkosService } from '../funkos.service'

@Injectable()
export class FunkoExistsGuard implements CanActivate {
  constructor(private readonly funkosService: FunkosService) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const prodId = parseInt(req.params.id, 10)

    if (isNaN(prodId)) {
      throw new BadRequestException('El ID del Funko no es Valido')
    }

    return this.funkosService.findOne(prodId).then((exists) => {
      if (!exists) {
        throw new BadRequestException('El Funko no existe')
      }
      return true
    })
  }
}
