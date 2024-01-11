import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkosMapper } from './mapper/funkos.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Categoria } from '../categoria/entities/categoria.entity'
import { Repository } from 'typeorm'
import { StorageService } from '../storage/storage.service'
import { Request } from 'express'
import {
  Notificacion,
  NotificacionTipo,
} from '../websockets/notification/model/notification.model'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class FunkosService {
  private readonly logger: Logger = new Logger(FunkosService.name)
  constructor(
    private readonly funkosMapper: FunkosMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createFunkoDto: CreateFunkoDto) {
    const category = await this.findCategory(createFunkoDto.category)
    const funkosave = this.funkosMapper.mapFunko(createFunkoDto, category)
    const funkoReturn = await this.funkoRepository.save(funkosave)
    this.onChange(NotificacionTipo.CREATE, funkoReturn)
    await this.invalidateCacheKey('all_funkos')
    return funkoReturn
  }

  async findAll() {
    const cache: Funko[] = await this.cacheManager.get('all_funkos')
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const funkos = await this.funkoRepository.find({ relations: ['category'] })
    await this.cacheManager.set('all_funkos', funkos, 60000)
    funkos.forEach((fk) => this.logger.log(`Funko: ${fk.category}`))
    return funkos
  }

  async findOne(id: number) {
    const cache: Funko = await this.cacheManager.get(`funkos_${id}`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const funkoFind = await this.funkoRepository.findOne({
      where: { id },
      relations: ['category'],
    })
    if (!funkoFind) {
      throw new NotFoundException(`Funko con ID ${id} no encontrado`)
    }
    this.cacheManager.set(`funkos_${id}`, funkoFind, 60000)
    return funkoFind
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const funkoFind = await this.findOne(id)
    const funtoRetunr = await this.funkoRepository.save(
      this.funkosMapper.mapFunkoUpd(
        updateFunkoDto,
        funkoFind,
        updateFunkoDto.category
          ? await this.findCategory(updateFunkoDto.category)
          : undefined,
      ),
    )
    this.onChange(NotificacionTipo.UPDATE, funtoRetunr)
    await this.invalidateCacheKey('all_funkos')
    await this.invalidateCacheKey(`funkos_${id}`)
    return funtoRetunr
  }

  async remove(id: number) {
    const funko = await this.findOne(id)
    this.onChange(NotificacionTipo.DELETE, funko)
    await this.invalidateCacheKey(`funkos_${id}`)
    return await this.funkoRepository.delete({ id })
  }

  async findCategory(name: string) {
    const category = await this.categoriaRepository.findOneBy({
      nombreCategoria: name.toUpperCase(),
    })
    if (!category) {
      throw new NotFoundException(`Categoria no encontrada con nombre ${name}`)
    }
    return category
  }

  public async updateImg(
    id: number,
    fileImg: Express.Multer.File,
    withUrl: boolean = true,
  ) {
    this.logger.log(`Update image funko with id:${id}`)
    if (!fileImg) {
      throw new BadRequestException('No se recibio el archivo')
    }

    const funkoUpd = await this.findOne(id)

    if (funkoUpd.img !== Funko.IMG_DEFAULT) {
      this.logger.log('Borrando imagen anterior')
      try {
        this.storageService.removeFile(
          withUrl
            ? this.storageService.getFileNameWithoutUrl(funkoUpd.img)
            : funkoUpd.img,
        )
      } catch (err) {
        this.logger.error(err)
      }
    }
    funkoUpd.img = withUrl
      ? this.storageService.generateUrl(fileImg.filename)
      : fileImg.filename
    const funkoReturn = await this.funkoRepository.save(funkoUpd)
    this.onChange(NotificacionTipo.UPDATE, funkoReturn)
    await this.invalidateCacheKey('all_funkos')
    await this.invalidateCacheKey(`funkos_${id}`)
    return funkoReturn
  }

  private onChange(tipo: NotificacionTipo, data: Funko) {
    const dataToSend = this.funkosMapper.mapResponse(data)
    const notification = new Notificacion<ResponseFunkoDto>(
      'FUNKOS',
      tipo,
      dataToSend,
      new Date(),
    )

    this.notificationService.sendMessage(notification)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
