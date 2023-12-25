import { Module } from '@nestjs/common'
import { CategoriaService } from './categoria.service'
import { CategoriaController } from './categoria.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriaMapper } from './mapper/categoria.mapper'

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaMapper],
})
export class CategoriaModule {}
