import { Test, TestingModule } from '@nestjs/testing'
import { FunkosService } from './funkos.service'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { FunkosMapper } from './mapper/funkos.mapper'
import { Repository } from 'typeorm'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categoria/entities/categoria.entity'
import { UpdateFunkoDto } from './dto/update-funko.dto'

describe('FunkosService', () => {
  let postgresContainer
  let repository
  let cateRepository
  let service: FunkosService

  const funkosMapper = {
    mapFunko: jest.fn(),
    mapFunkoUpd: jest.fn(),
  }
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
      providers: [
        FunkosService,
        { provide: FunkosMapper, useValue: funkosMapper },
      ],
    }).compile()

    service = module.get<FunkosService>(FunkosService)
    repository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
    cateRepository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    await cateRepository.save(category)
    await repository.save(funkoTest)
  })

  afterAll(async () => {
    await postgresContainer.stop()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of funkos', async () => {
      const funkos = await service.findAll()
      expect(funkos.length).toBe(1)
      expect(funkos[0].category.nombreCategoria).toEqual(
        category.nombreCategoria,
      )
    })
  })

  describe('findOne', () => {
    it('should return a funko', async () => {
      const funko = await service.findOne(1)
      expect(funko.category.nombreCategoria).toEqual(category.nombreCategoria)
    })

    it('should throw an exception if funko does not exists', async () => {
      await expect(() => service.findOne(0)).rejects.toHaveProperty(
        'message',
        'Funko con ID 0 no encontrado',
      )
    })
  })

  describe('create', () => {
    it('should create a funko', async () => {
      const createFunkoDto = {
        name: 'test',
        price: 100,
        category: 'test',
        quantity: 10,
      }
      jest.spyOn(funkosMapper, 'mapFunko').mockReturnValue(funkoTest)
      const funko = await service.create(createFunkoDto)
      expect(funko.category.nombreCategoria).toEqual(category.nombreCategoria)
      expect(funko.name).toEqual(createFunkoDto.name)
      expect(funkosMapper.mapFunko).toHaveBeenCalled()
    })

    it('should throw a exception if the category does not exists', async () => {
      const createFunkoDto = {
        name: 'test',
        price: 100,
        category: 'noTest',
        quantity: 10,
      }
      await expect(() => service.create(createFunkoDto)).rejects.toHaveProperty(
        'message',
        'Categoria no encontrada con nombre noTest',
      )
    })
  })

  describe('update', () => {
    it('should update a funko', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'test',
      }

      jest.spyOn(funkosMapper, 'mapFunkoUpd').mockReturnValue(funkoTest)

      const funko = await service.update(1, updateFunkoDto)
      expect(funko.category.nombreCategoria).toEqual(category.nombreCategoria)
      expect(funkosMapper.mapFunkoUpd).toHaveBeenCalled()
    })

    it('should throw an exception if funko does not exists', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'test',
      }

      await expect(() =>
        service.update(0, updateFunkoDto),
      ).rejects.toHaveProperty('message', 'Funko con ID 0 no encontrado')
    })

    it('should throw an exception if the category does not exists', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'test',
        category: 'noTest',
      }

      await expect(() =>
        service.update(1, updateFunkoDto),
      ).rejects.toHaveProperty(
        'message',
        'Categoria no encontrada con nombre noTest',
      )
    })
  })

  describe('remove', () => {
    it('should remove a funko', async () => {
      const funko = await service.remove(1)
      expect(funko.affected).toBe(1)
    })

    it('should throw an exception if funko does not exists', async () => {
      await expect(() => service.remove(0)).rejects.toHaveProperty(
        'message',
        'Funko con ID 0 no encontrado',
      )
    })
  })
})
