import { Module } from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { FunkosController } from './funkos.controller'
import { FunkoExistsGuard } from './guards/funko-exists.guard'
import { FunkosMapper } from './mapper/funkos.mapper'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categoria/entities/categoria.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkoExistsGuard, FunkosMapper],
})
export class FunkosModule {}
