import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { Categoria } from './entities/categoria.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { v4 as uuidv4 } from 'uuid'
import { Funko } from '../funkos/entities/funko.entity'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import {
  Notificacion,
  NotificacionTipo,
} from '../websockets/notification/model/notification.model'
import { ResponseCategoriaDto } from './dto/response-categoria.dto'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { PaginationResponse } from '../pagination/pagination-response'

@Injectable()
export class CategoriaService {
  private readonly logger: Logger = new Logger(CategoriaService.name)
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    private readonly categoriaMapper: CategoriaMapper,
    private readonly notificationGateway: NotificationGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createCategoriaDto: CreateCategoriaDto) {
    const findCategory = await this.categoriaRepository.findOneBy({
      nombreCategoria: createCategoriaDto.nombreCategoria.toUpperCase(),
    })
    if (findCategory) {
      throw new BadRequestException('La categoria ya existe')
    }
    const cateReturn = await this.categoriaRepository.save({
      ...this.categoriaMapper.mapCategoria(createCategoriaDto),
      id: uuidv4(),
    })
    this.onChange(NotificacionTipo.CREATE, cateReturn)
    await this.invalidateCacheKey('all_categories')
    return cateReturn
  }

  async findAllPag(query: PaginateQuery) {
    this.logger.log('Mostrando las Categorias Paginadas')

    const cache = await this.cacheManager.get(
      `all_categories_paginated_${JSON.stringify(query)}`,
    )

    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const pagination = await paginate(query, this.categoriaRepository, {
      sortableColumns: ['nombreCategoria'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['nombreCategoria'],
      filterableColumns: {
        nombreCategoria: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })

    const res: PaginationResponse = {
      data: (pagination.data ?? []).map((data) =>
        this.categoriaMapper.mapResponse(data),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    await this.cacheManager.set(
      `all_categories_paginated_${JSON.stringify(query)}`,
      res,
      60000,
    )

    return res
  }

  async findAll() {
    const cache: Categoria[] = await this.cacheManager.get('all_categories')
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const listCate = await this.categoriaRepository.find()
    this.cacheManager.set('all_categories', listCate, 60000)
    return listCate
  }

  async findOne(id: string) {
    const cache: Categoria = await this.cacheManager.get(`category_${id}`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const cateFind = await this.categoriaRepository.findOneBy({ id })
    if (!cateFind) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`)
    }
    await this.cacheManager.set(`category_${id}`, cateFind, 60000)
    return cateFind
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    const cateFind: Categoria = await this.findOne(id)
    const cateReturn = await this.categoriaRepository.save(
      this.categoriaMapper.mapCategoriaUpd(updateCategoriaDto, cateFind),
    )
    this.onChange(NotificacionTipo.UPDATE, cateReturn)
    await this.invalidateCacheKey('all_categories')
    await this.invalidateCacheKey(`category_${id}`)
    return cateReturn
  }

  async remove(id: string) {
    const cateFind = await this.findOne(id)
    const listFunk = await this.funkoRepository.findBy({ category: cateFind })
    this.onChange(NotificacionTipo.DELETE, cateFind)
    await this.invalidateCacheKey(`category_${id}`)
    if (!listFunk) {
      return await this.categoriaRepository.delete({ id })
    }
    return await this.removeSoft(id)
  }

  async removeSoft(id: string) {
    const cateFind = await this.findOne(id)
    const cateRem: Categoria = {
      ...cateFind,
      updatedAt: new Date(),
      isDeleted: true,
    }
    return await this.categoriaRepository.save(cateRem)
  }

  onChange(type: NotificacionTipo, data: Categoria) {
    const dataToSend = this.categoriaMapper.mapResponse(data)
    const notification = new Notificacion<ResponseCategoriaDto>(
      'CATEGORIAS',
      type,
      dataToSend,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
