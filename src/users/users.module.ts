import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { UserRole } from './entities/user-role.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { PedidosModule } from '../pedidos/pedidos.module'
import { UsersMapper } from './mapper/users.mapper'
import { BcryptService } from './bcrypt.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserRole]),
    CacheModule.register(),
    PedidosModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersMapper, BcryptService],
})
export class UsersModule {}
