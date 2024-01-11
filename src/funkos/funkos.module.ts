import { Module } from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { FunkosController } from './funkos.controller'
import { FunkoExistsGuard } from './guards/funko-exists.guard'
import { FunkosMapper } from './mapper/funkos.mapper'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categoria/entities/categoria.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StorageService } from '../storage/storage.service'
import { StorageModule } from '../storage/storage.module'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Categoria]),
    StorageModule,
    CacheModule.register(),
  ],
  controllers: [FunkosController],
  providers: [
    FunkosService,
    FunkoExistsGuard,
    FunkosMapper,
    StorageService,
    NotificationGateway,
  ],
})
export class FunkosModule {}
