import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import type { ObjectId } from 'mongodb'
import { Pedido } from './entities/pedido.schema'
import { Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PedidosMapper } from './mapper/pedidos.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity'
import { Funko } from '../funkos/entities/funko.entity'

@Injectable()
export class PedidosService {
  private readonly logger: Logger = new Logger(PedidosService.name)
  constructor(
    @InjectRepository(Pedido, 'mongo')
    private readonly pedidoRepostory: Repository<Pedido>,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pedidosMapper: PedidosMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cache: Pedido[] = await this.cacheManager.get(`all_orders`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const findAll = await this.pedidoRepostory.find()
    await this.cacheManager.set(`all_orders_page`, findAll, 60000)
    return findAll
  }

  async findOne(id: ObjectId) {
    this.logger.log(`FindOne ${id}`)
    const res = await this.pedidoRepostory.findOneBy({
      idBusqueda: id.toString(),
    })
    if (!res) {
      this.logger.error('El pedido no existe')
      throw new NotFoundException('El pedido no existe')
    }
    return res
  }

  async findByIdUsuario(idUsuario: number) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidoRepostory.find({
      where: { idUsuario },
    })
  }
  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log('Saving Order')
    const pedidoToSave = this.pedidosMapper.mapToPedido(createPedidoDto)
    await this.checkPedido(pedidoToSave)

    const pedidoFinal = await this.reserveStockPedidos(pedidoToSave)

    pedidoToSave.createdAt = new Date()
    pedidoToSave.updatedAt = new Date()

    const pedidoGuardado = await this.pedidoRepostory.save(pedidoFinal)
    pedidoGuardado.idBusqueda = pedidoGuardado._id.toString()
    return await this.pedidoRepostory.save(pedidoGuardado)
  }

  async update(id: ObjectId, updatePedidoDto: UpdatePedidoDto) {
    this.logger.log(`Updating Order with ID: ${id}`)
    const pedidoBus = await this.findOne(id)

    await this.returnStockPedidos(pedidoBus)

    const pedidoUpdate = this.pedidosMapper.mapToPedidoUpd(
      updatePedidoDto,
      pedidoBus,
    )

    await this.checkPedido(pedidoUpdate)

    const pedidoFinal = await this.reserveStockPedidos(pedidoUpdate)

    pedidoFinal.updatedAt = new Date()

    return await this.pedidoRepostory.save(pedidoFinal)
  }

  async remove(id: ObjectId) {
    this.logger.log(`Removing Order with ID: ${id}`)
    const pedidoRemove = await this.findOne(id)

    await this.returnStockPedidos(pedidoRemove)
    return this.pedidoRepostory.remove(pedidoRemove)
  }

  async userExists(idUsuario: number): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${idUsuario}`)
    const usuario = await this.userRepository.findOneBy({ id: idUsuario })
    return !!usuario
  }

  async getPedidosByUser(idUsuario: number): Promise<Pedido[]> {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidoRepostory.find({ where: { idUsuario } })
  }

  private async checkPedido(pedido: Pedido): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(
        'No se han agregado lineas de pedido al pedido actual',
      )
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const producto = await this.funkoRepository.findOneBy({
        id: lineaPedido.idProducto,
      })
      if (!producto) {
        throw new BadRequestException(
          `El Funko con ID: ${lineaPedido.idProducto} no existe`,
        )
      }
      if (
        producto.quantity < lineaPedido.cantidad &&
        lineaPedido.cantidad > 0
      ) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del Funko ${producto.id}`,
        )
      }
      if (producto.price !== lineaPedido.precioProducto) {
        throw new BadRequestException(
          `El precio del Funko ${producto.id} del pedido no coincide con el precio actual del Funko`,
        )
      }
    }
  }

  private async reserveStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Reservando stock del pedido: ${pedido}`)

    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(`No se han agregado lineas de pedido`)
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const producto = await this.funkoRepository.findOneBy({
        id: lineaPedido.idProducto,
      })
      producto.quantity -= lineaPedido.cantidad
      await this.funkoRepository.save(producto)
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioProducto
    }

    pedido.total = pedido.lineasPedido.reduce(
      (sum, lineaPedido) =>
        sum + lineaPedido.cantidad * lineaPedido.precioProducto,
      0,
    )
    pedido.totalItems = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad,
      0,
    )

    return pedido
  }

  private async returnStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Retornando stock del pedido: ${pedido}`)
    if (pedido.lineasPedido) {
      for (const lineaPedido of pedido.lineasPedido) {
        const producto = await this.funkoRepository.findOneBy({
          id: lineaPedido.idProducto,
        })
        producto.quantity += lineaPedido.cantidad
        await this.funkoRepository.save(producto)
      }
    }
    return pedido
  }
}
