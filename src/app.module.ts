import { Module } from '@nestjs/common'
import { FunkosModule } from './funkos/funkos.module'
import { ConfigModule } from '@nestjs/config'
import { CategoriaModule } from './categoria/categoria.module'
import { StorageModule } from './storage/storage.module'
import { NotificationGateway } from './websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'
import {
  DatabaseModule,
  MongoDbModule,
} from './config/database/database.module'
import { PedidosModule } from './pedidos/pedidos.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { CorsConfigModule } from './config/cors/cors.module'

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    DatabaseModule,
    MongoDbModule,
    AuthModule,
    FunkosModule,
    CategoriaModule,
    StorageModule,
    CacheModule.register(),
    PedidosModule,
    UsersModule,
  ],
  controllers: [],
  providers: [NotificationGateway],
})
export class AppModule {}
