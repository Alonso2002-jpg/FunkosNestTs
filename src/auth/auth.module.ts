import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from '../users/users.module'
import { AuthMapper } from './mapper/users.mapper'
import { JwtAuthStrategy } from './strategies/jwt-strategy'
import { UsersService } from '../users/users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../users/entities/user-role.entity'
import { PedidosService } from '../pedidos/pedidos.service'
import { UsersMapper } from '../users/mapper/users.mapper'
import { BcryptService } from '../users/bcrypt.service'
import { Pedido } from '../pedidos/entities/pedido.schema'
import { Funko } from '../funkos/entities/funko.entity'
import { PedidosMapper } from '../pedidos/mapper/pedidos.mapper'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    // Configuración edl servicio de JWT
    JwtModule.register({
      // Lo voy a poner en base64
      secret: Buffer.from(
        process.env.TOKEN_SECRET ||
          'Me_Gustan_Los_Pepinos_De_Leganes_Porque_Son_Grandes_Y_Hermosos',
        'utf-8',
      ).toString('base64'),
      signOptions: {
        expiresIn: Number(process.env.TOKEN_EXPIRES) || 3600, // Tiempo de expiracion
        algorithm: 'HS512', // Algoritmo de encriptacion
      },
    }),
    CacheModule.register(),
    TypeOrmModule.forFeature([Pedido], 'mongo'),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    TypeOrmModule.forFeature([Funko]),
    // Importamos el módulo de passport con las estrategias
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Importamos el módulo de usuarios porque usaremos su servicio
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthMapper,
    JwtAuthStrategy,
    UsersService,
    PedidosService,
    UsersMapper,
    BcryptService,
    PedidosMapper,
  ],
})
export class AuthModule {}
