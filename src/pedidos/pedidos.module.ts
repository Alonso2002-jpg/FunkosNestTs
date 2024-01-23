import { Module } from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { PedidosController } from './pedidos.controller'
import { Pedido } from './entities/pedido.schema'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { Funko } from '../funkos/entities/funko.entity'
import { PedidosMapper } from './mapper/pedidos.mapper'
import { User } from '../users/entities/user.entity'
import { FunkosService } from '../funkos/funkos.service'
import { UsersService } from '../users/users.service'
import { FunkosMapper } from '../funkos/mapper/funkos.mapper'
import { FunkosModule } from '../funkos/funkos.module'
import { CategoriaModule } from '../categoria/categoria.module'
import { Categoria } from '../categoria/entities/categoria.entity'
import { StorageService } from '../storage/storage.service'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import { UserRole } from '../users/entities/user-role.entity'
import { UsersMapper } from '../users/mapper/users.mapper'
import { BcryptService } from '../users/bcrypt.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido], 'mongo'),
    CacheModule.register(),
    TypeOrmModule.forFeature([Funko, Categoria, User]),
    TypeOrmModule.forFeature([UserRole]),
  ],
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PedidosMapper,
    FunkosService,
    UsersService,
    StorageService,
    NotificationGateway,
    FunkosMapper,
    UsersMapper,
    BcryptService,
  ],
  exports: [PedidosService],
})
export class PedidosModule {}
