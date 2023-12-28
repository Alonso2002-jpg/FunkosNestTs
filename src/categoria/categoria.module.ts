import { Module } from '@nestjs/common'
import { CategoriaService } from './categoria.service'
import { CategoriaController } from './categoria.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { Funko } from '../funkos/entities/funko.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaMapper],
})
export class CategoriaModule {}
