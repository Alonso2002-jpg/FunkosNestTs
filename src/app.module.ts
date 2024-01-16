import { Module } from '@nestjs/common'
import { FunkosModule } from './funkos/funkos.module'
import { ConfigModule } from '@nestjs/config'
import { CategoriaModule } from './categoria/categoria.module'
import { StorageModule } from './storage/storage.module'
import { NotificationGateway } from './websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'
import { DatabaseModule } from './config/database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    FunkosModule,
    CategoriaModule,
    StorageModule,
    CacheModule.register(),
  ],
  controllers: [],
  providers: [NotificationGateway, NotificationGateway],
})
export class AppModule {}
