import { Module } from '@nestjs/common'
import { CategoriaService } from './categoria.service'
import { CategoriaController } from './categoria.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { Funko } from '../funkos/entities/funko.entity'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
    CacheModule.register(),
  ],
  controllers: [CategoriaController],
  providers: [CategoriaService, CategoriaMapper, NotificationGateway],
})
export class CategoriaModule {}
