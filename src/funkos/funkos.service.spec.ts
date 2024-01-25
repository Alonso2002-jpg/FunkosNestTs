import { Test, TestingModule } from '@nestjs/testing'
import { FunkosService } from './funkos.service'
import { DeleteResult, Repository } from 'typeorm'
import { Funko } from './entities/funko.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { StorageService } from '../storage/storage.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Categoria } from '../categoria/entities/categoria.entity'
import { FunkosMapper } from './mapper/funkos.mapper'
import { NotificationGateway } from '../websockets/notification/notification.gateway'
import { ResponseFunkoDto } from './dto/response-funko.dto'

describe('FunkosService', () => {
  let service: FunkosService
  let funkosRepository: Repository<Funko>
  let categoriaRepository: Repository<Categoria>
  let mapper: FunkosMapper
  let storageService: StorageService
  let notificationsGateway: NotificationGateway
  let cacheManager: Cache

  const funkoMapperMock = {
    mapFunko: jest.fn(),
    mapFunkoUpd: jest.fn(),
    mapResponse: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
  }

  const notificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunkosService,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Categoria), useClass: Repository },
        { provide: FunkosMapper, useValue: funkoMapperMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: NotificationGateway, useValue: notificationsGatewayMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<FunkosService>(FunkosService)
    funkosRepository = module.get(getRepositoryToken(Funko))
    categoriaRepository = module.get(getRepositoryToken(Categoria))
    mapper = module.get<FunkosMapper>(FunkosMapper)
    storageService = module.get<StorageService>(StorageService)
    notificationsGateway = module.get<NotificationGateway>(NotificationGateway)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of funkos response', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
      }

      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(mapper, 'mapResponse').mockReturnValue(new ResponseFunkoDto())

      const result: any = await service.findAllPag(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `funkos?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should retrieve a funk by id', async () => {
      const result = new Funko()

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(result)

      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.findOne(1)).toBeInstanceOf(Funko)
    })

    it("should throw an error if the funk doesn't exist", async () => {
      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(undefined)
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new funko response', async () => {
      const categoria: Categoria = new Categoria()
      const funk: Funko = new Funko()
      const funkCreateDto: CreateFunkoDto = new CreateFunkoDto()
      jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(categoria)
      jest.spyOn(mapper, 'mapFunko').mockReturnValue(funk)
      jest.spyOn(funkosRepository, 'save').mockResolvedValue(funk)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      expect(await service.create(funkCreateDto)).toBeInstanceOf(Funko)
      expect(mapper.mapFunko).toHaveBeenCalled()
      expect(funkosRepository.save).toHaveBeenCalled()
      expect(notificationsGateway.sendMessage).toHaveBeenCalled()
    })

    it("should throw an error if category doesn't exist", async () => {
      const funkCreateDto: CreateFunkoDto = new CreateFunkoDto()
      jest.spyOn(categoriaRepository, 'findOneBy').mockResolvedValue(undefined)

      await expect(service.create(funkCreateDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update an exist funk with an update request', async () => {
      const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto()
      funkUpdateDto.name = 'Funk Updated'
      funkUpdateDto.quantity = 10
      funkUpdateDto.price = 29.99
      const actualFunk: Funko = new Funko()
      const updatedFunk: Funko = new Funko()

      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(actualFunk)
      jest.spyOn(mapper, 'mapFunkoUpd').mockReturnValue(updatedFunk)
      jest.spyOn(funkosRepository, 'save').mockResolvedValue(updatedFunk)

      expect(await service.update(1, funkUpdateDto)).toBeInstanceOf(Funko)
      expect(mapper.mapFunkoUpd).toHaveBeenCalled()
      expect(funkosRepository.save).toHaveBeenCalled()
      expect(notificationsGateway.sendMessage).toHaveBeenCalled()
    })

    it("should throw an error if doesn't exist any Funk by id", async () => {
      const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto()
      funkUpdateDto.isDeleted = true

      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(undefined)

      await expect(service.update(1, funkUpdateDto)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should call the remove method', async () => {
      const funkToDelete: Funko = new Funko()
      const result: ResponseFunkoDto = new ResponseFunkoDto()
      result.id = 1
      result.isDeleted = true

      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(funkToDelete)
      jest
        .spyOn(funkosRepository, 'delete')
        .mockResolvedValue(new DeleteResult())
      jest.spyOn(funkoMapperMock, 'mapResponse').mockReturnValue(result)

      await service.remove(1)
      expect(funkosRepository.delete).toHaveBeenCalledTimes(1)
      expect(funkoMapperMock.mapResponse).toHaveBeenCalled()
      expect(notificationsGateway.sendMessage).toHaveBeenCalled()
    })

    it("should throw an error if funkoToDelete doesn't exist", async () => {
      jest.spyOn(funkosRepository, 'findOne').mockResolvedValue(undefined)

      await expect(service.remove(1)).rejects.toThrow(NotFoundException)
    })
  })
})
