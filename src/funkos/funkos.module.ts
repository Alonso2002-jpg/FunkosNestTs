import { Module } from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { FunkosController } from './funkos.controller'
import { FunkoExistsGuard } from './guards/funko-exists.guard'
import { FunkosMapper } from './mapper/funkos.mapper'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService, FunkoExistsGuard, FunkosMapper],
})
export class FunkosModule {}
