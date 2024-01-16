import { Test, TestingModule } from '@nestjs/testing'
import { FunkosController } from './funkos.controller'
import { FunkosService } from './funkos.service'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categoria/entities/categoria.entity'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { FunkosMapper } from './mapper/funkos.mapper'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { Repository } from 'typeorm'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { StorageService } from '../storage/storage.service'
import { NotificationGateway } from '../websockets/notification/notification.gateway'

describe('FunkosController', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let controller: FunkosController
  let notificationGateway: NotificationGateway
  let repository: Repository<Funko>
  let cateRepository: Repository<Categoria>

  const notiMock = {
    sendMessage: jest.fn(),
  }

  const category: Categoria = {
    id: '14c56c95-1cbf-4c65-a0c3-025899d2e2d1',
    nombreCategoria: 'TEST',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    funkos: [],
  }

  const funkoTest: Funko = {
    id: 1,
    name: 'test',
    price: 100,
    category,
    img: Funko.IMG_DEFAULT,
    quantity: 10,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start()
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(), // Nombre de usuario
          password: postgresContainer.getPassword(), // Contraseña de usuario
          database: postgresContainer.getDatabase(), // Nombre de la base de datos
          entities: [Funko, Categoria], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
          synchronize: true, // Sincronizar la base de datos
        }),
        TypeOrmModule.forFeature([Funko, Categoria]),
        CacheModule.register(),
      ],
      controllers: [FunkosController],
      providers: [
        FunkosService,
        FunkosMapper,
        StorageService,
        { provide: NotificationGateway, useValue: notiMock },
      ],
    }).compile()

    controller = module.get<FunkosController>(FunkosController)
    repository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    cateRepository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
  })
  beforeEach(async () => {
    await cateRepository.save(category)
    await repository.save(funkoTest)
  })

  afterEach(async () => {
    await repository.query(`TRUNCATE TABLE funko RESTART IDENTITY CASCADE`)
    await cateRepository.query(
      `TRUNCATE TABLE category RESTART IDENTITY CASCADE`,
    )
  })
  afterAll(() => {
    postgresContainer.stop()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of funkos response paginated', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }
      const funkos: any = await controller.findAll(paginateOptions)
      expect(funkos.meta.itemsPerPage).toBe(10)
      expect(funkos.meta.currentPage).toEqual(paginateOptions.page)
    })
  })

  describe('findOne', () => {
    it('should return a funko response', async () => {
      const funko = await controller.findOne(1)
      expect(funko).toBeInstanceOf(ResponseFunkoDto)
    })

    it('should throw an exception if funko does not exists', async () => {
      await expect(() => controller.findOne(0)).rejects.toHaveProperty(
        'message',
        'Funko con ID 0 no encontrado',
      )
    })
  })

  describe('create', () => {
    it('should create a funko', async () => {
      const createFunkoDto: CreateFunkoDto = {
        name: 'test2',
        price: 100,
        category: 'TEST',
        quantity: 10,
      }
      jest.spyOn(notificationGateway, 'sendMessage').mockReturnValue()

      const funko = await controller.create(createFunkoDto)
      expect(funko.category).toEqual(category.nombreCategoria)
      expect(funko.name).toEqual(createFunkoDto.name)
    })

    it('should throw a exception if the category does not exists', async () => {
      const createFunkoDto: CreateFunkoDto = {
        name: 'test',
        price: 100,
        category: 'noTest',
        quantity: 10,
      }
      await expect(() =>
        controller.create(createFunkoDto),
      ).rejects.toHaveProperty(
        'message',
        'Categoria no encontrada con nombre noTest',
      )
    })
  })

  describe('update', () => {
    it('should update a funko', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'newTest',
      }

      const funko = await controller.update(1, updateFunkoDto)

      expect(funko.category).toEqual(category.nombreCategoria)
      expect(funko.name).toEqual(updateFunkoDto.name)
    })

    it('should throw an exception if funko does not exists', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'newTest',
      }

      await expect(() =>
        controller.update(0, updateFunkoDto),
      ).rejects.toHaveProperty('message', 'Funko con ID 0 no encontrado')
    })

    it('should throw an exception if the category does not exists', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'newTest',
        category: 'noTest',
      }

      await expect(() =>
        controller.update(1, updateFunkoDto),
      ).rejects.toHaveProperty(
        'message',
        'Categoria no encontrada con nombre noTest',
      )
    })
  })

  describe('remove', () => {
    it('should remove a funko', async () => {
      const funko = await controller.remove(1)
      expect(funko.affected).toBe(1)
    })

    it('should throw an exception if funko does not exists', async () => {
      await expect(() => controller.remove(0)).rejects.toHaveProperty(
        'message',
        'Funko con ID 0 no encontrado',
      )
    })
  })

  describe('updateImage', () => {
    it('should update a funk image', async () => {
      await repository.save(funkoTest)
      const mockFile = {} as Express.Multer.File
      jest.spyOn(notificationGateway, 'sendMessage').mockReturnValue()
      const res = await controller.updateImg(1, mockFile)
      expect(res).toBeInstanceOf(ResponseFunkoDto)
    })
  })
})
