import { Module } from '@nestjs/common'
import { FunkosModule } from './funkos/funkos.module'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriaModule } from './categoria/categoria.module'
import { StorageModule } from './storage/storage.module'
import { NotificationGateway } from './websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    ConfigModule.forRoot(),
    FunkosModule,
    CategoriaModule,
    StorageModule,
    // Configuración de la conexión a la base de datos a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres', // Tipo de base de datos
      host: 'localhost', // Dirección del servidor
      port: 5432, // Puerto del servidor
      username: 'admin', // Nombre de usuario
      password: 'admin123', // Contraseña de usuario
      database: 'funkos', // Nombre de la base de datos
      entities: [`${__dirname}/**/*.entity{.ts,.js}`], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
      synchronize: true, // Sincronizar la base de datos
    }),
    CacheModule.register(),
  ],
  controllers: [],
  providers: [NotificationGateway, NotificationGateway],
})
export class AppModule {}
