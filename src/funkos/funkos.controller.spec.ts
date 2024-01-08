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

describe('FunkosController', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let controller: FunkosController

  const category: Categoria = {
    id: '14c56c95-1cbf-4c65-a0c3-025899d2e2d1',
    nombreCategoria: 'test',
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
      ],
      controllers: [FunkosController],
      providers: [FunkosService, FunkosMapper],
    }).compile()

    controller = module.get<FunkosController>(FunkosController)
    const repository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    const cateRepository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    await cateRepository.save(category)
    await repository.save(funkoTest)
  })

  afterAll(() => {
    postgresContainer.stop()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of funkos response', async () => {
      const funkos = await controller.findAll()
      expect(funkos.length).toBe(1)
      expect(funkos[0]).toBeInstanceOf(ResponseFunkoDto)
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
        name: 'test',
        price: 100,
        category: 'test',
        quantity: 10,
      }
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
})
