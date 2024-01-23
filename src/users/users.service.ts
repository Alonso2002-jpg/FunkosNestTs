import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { Role, UserRole } from './entities/user-role.entity'
import { BcryptService } from './bcrypt.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { PedidosService } from '../pedidos/pedidos.service'
import { CreatePedidoDto } from '../pedidos/dto/create-pedido.dto'
import { UpdatePedidoDto } from '../pedidos/dto/update-pedido.dto'
import { ObjectId } from 'mongodb'
import { UsersMapper } from './mapper/users.mapper'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    @InjectRepository(User)
    private readonly usuariosRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly pedidosService: PedidosService,
    private readonly usuariosMapper: UsersMapper,
    private readonly bcryptService: BcryptService,
  ) {}

  async findAll() {
    this.logger.log('findAll')
    return (await this.usuariosRepository.find()).map((u) =>
      this.usuariosMapper.toResponseDto(u),
    )
  }

  async findOne(id: number) {
    this.logger.log(`findOne: ${id} en service`)
    const userFind = await this.usuariosRepository.findOneBy({ id })
    if (!userFind) {
      throw new NotFoundException(`User not found with id ${id}`)
    }
    return this.usuariosMapper.toResponseDto(userFind)
  }

  async create(createUserDto: CreateUserDto) {
    this.logger.log('create')
    const existingUser = await Promise.all([
      this.findByUsername(createUserDto.username),
      this.findByEmail(createUserDto.email),
    ])
    if (existingUser[0]) {
      throw new BadRequestException('username already exists')
    }

    if (existingUser[1]) {
      throw new BadRequestException('email already exists')
    }
    const hashPassword = await this.bcryptService.hash(createUserDto.password)

    const usuario = this.usuariosMapper.toEntity(createUserDto)
    usuario.password = hashPassword
    const user = await this.usuariosRepository.save(usuario)
    const roles = createUserDto.roles || [Role.USER]
    const userRoles = roles.map((role) => ({ usuario: user, role: Role[role] }))
    const savedUserRoles = await this.userRoleRepository.save(userRoles)

    return this.usuariosMapper.toResponseDtoWithRoles(user, savedUserRoles)
  }

  validateRoles(roles: string[]): boolean {
    return roles.every((role) => Role[role])
  }

  async findByUsername(username: string) {
    this.logger.log(`findByUsername: ${username}`)
    return await this.usuariosRepository.findOneBy({ username })
  }

  async validatePassword(password: string, hashPassword: string) {
    this.logger.log(`validatePassword`)
    return await this.bcryptService.isMatch(password, hashPassword)
  }

  async deleteById(idUser: number) {
    this.logger.log(`deleteUserById: ${idUser}`)
    const user = await this.usuariosRepository.findOneBy({ id: idUser })
    if (!user) {
      throw new NotFoundException(`User not found with id ${idUser}`)
    }
    const existsPedidos = await this.pedidosService.userExists(user.id)
    if (existsPedidos) {
      user.updatedAt = new Date()
      user.isDeleted = true
      return await this.usuariosRepository.save(user)
    } else {
      for (const userRole of user.roles) {
        await this.userRoleRepository.remove(userRole)
      }
      return await this.usuariosRepository.delete({ id: user.id })
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updateRoles: boolean = false,
  ) {
    this.logger.log(
      `updateUserProfileById: ${id} with ${JSON.stringify(updateUserDto)}`,
    )
    const user = await this.usuariosRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User not found with id ${id}`)
    }

    if (updateUserDto.username) {
      const existingUser = await this.findByUsername(updateUserDto.username)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('username already exists')
      }
    }
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email)
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('email already exists')
      }
    }
    if (updateUserDto.password) {
      updateUserDto.password = await this.bcryptService.hash(
        updateUserDto.password,
      )
    }
    const rolesBackup = [...user.roles]
    Object.assign(user, updateUserDto)

    if (updateRoles) {
      for (const userRole of rolesBackup) {
        await this.userRoleRepository.remove(userRole)
      }
      const roles = updateUserDto.roles || [Role.USER]
      const userRoles = roles.map((role) => ({
        usuario: user,
        role: Role[role],
      }))
      user.roles = await this.userRoleRepository.save(userRoles)
    } else {
      user.roles = rolesBackup
    }

    const updatedUser = await this.usuariosRepository.save(user)

    return this.usuariosMapper.toResponseDto(updatedUser)
  }

  async getPedidos(id: number) {
    return await this.pedidosService.getPedidosByUser(id)
  }

  async getPedido(idUser: number, idPedido: ObjectId) {
    const pedido = await this.pedidosService.findOne(idPedido)
    console.log(pedido.idUsuario)
    console.log(idUser)
    if (pedido.idUsuario != idUser) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return pedido
  }

  async createPedido(createPedidoDto: CreatePedidoDto, userId: number) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    if (createPedidoDto.idUsuario != userId) {
      throw new BadRequestException(
        'Producto idUsuario must be the same as the authenticated user',
      )
    }
    return await this.pedidosService.create(createPedidoDto)
  }

  async updatePedido(
    id: ObjectId,
    updatePedidoDto: UpdatePedidoDto,
    userId: number,
  ) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updatePedidoDto)}`,
    )
    if (updatePedidoDto.idUsuario != userId) {
      throw new BadRequestException(
        'Producto idUsuario must be the same as the authenticated user',
      )
    }
    const pedido = await this.pedidosService.findOne(id)
    if (pedido.idUsuario != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.pedidosService.update(id, updatePedidoDto)
  }

  async removePedido(idPedido: ObjectId, userId: number) {
    this.logger.log(`removePedido: ${idPedido}`)
    const pedido = await this.pedidosService.findOne(idPedido)
    if (pedido.idUsuario != userId) {
      throw new ForbiddenException(
        'Do not have permission to access this resource',
      )
    }
    return await this.pedidosService.remove(idPedido)
  }

  private async findByEmail(email: string) {
    this.logger.log(`findByEmail: ${email}`)
    return await this.usuariosRepository.findOneBy({ email })
  }
}
