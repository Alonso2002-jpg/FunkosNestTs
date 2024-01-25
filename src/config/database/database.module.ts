import * as process from 'process'
import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pedido } from '../../pedidos/entities/pedido.schema'
import { Funko } from '../../funkos/entities/funko.entity'
import { Categoria } from '../../categoria/entities/categoria.entity'
import { User } from '../../users/entities/user.entity'
import * as path from 'path'
import { UserRole } from '../../users/entities/user-role.entity'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        entities: [Funko, User, Categoria, UserRole],
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
        retryAttempts: 5,
        connectionFactory: (connection) => {
          Logger.log('Postgres database connected', 'DatabaseModule')
          return connection
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRoot({
      name: 'mongo',
      type: 'mongodb',
      url: `mongodb://${process.env.DATABASE_USER}:${
        process.env.DATABASE_PASSWORD
      }@${process.env.MONGO_HOST}:${process.env.MONGO_PORT || 27017}/${
        process.env.MONGO_DATABASE
      }`,
      entities: [Pedido],
      synchronize: process.env.NODE_ENV === 'dev',
      logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
      retryAttempts: 5,
    }),
  ],
  exports: [TypeOrmModule],
})
export class MongoDbModule {}
