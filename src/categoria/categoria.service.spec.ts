import { Test, TestingModule } from '@nestjs/testing'
import { CategoriaService } from './categoria.service'
import { Repository } from 'typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'

describe('CategoriaService', () => {
  let service: CategoriaService
  let repository: Repository<Categoria>
  let mapper: CategoriaMapper

  const categoryMapper = {
    mapCategoria: jest.fn(),
    mapCategoriaUpd: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriaService,
        { provide: CategoriaMapper, useValue: categoryMapper },
        { provide: getRepositoryToken(Categoria), useClass: Repository },
      ],
    }).compile()

    service = module.get<CategoriaService>(CategoriaService)

    repository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )

    mapper = module.get<CategoriaMapper>(CategoriaMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [new Categoria(), new Categoria(), new Categoria()]
      jest.spyOn(repository, 'find').mockResolvedValue(categories)

      const categoriesResult = await service.findAll()

      expect(categoriesResult.length).toBe(3)
      expect(categoriesResult[0]).toBeInstanceOf(Categoria)
    })
  })
  describe('findOne', () => {
    it('should return a category', async () => {
      const category: Categoria = {
        id: '08660c2f-1533-43c2-a6c9-070943589ee7',
        nombreCategoria: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      }
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)

      const categoryResult = await service.findOne(
        '08660c2f-1533-43c2-a6c9-070943589ee7',
      )

      expect(categoryResult).toBeInstanceOf(Categoria)
      expect(categoryResult.nombreCategoria).toBe(category.nombreCategoria)
    })

    it('should throw an error if the category is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a category', async () => {
      const categoryCreate: CreateCategoriaDto = {
        nombreCategoria: 'test',
        isDeleted: false,
      }

      const category: Categoria = {
        id: '08660c2f-1533-43c2-a6c9-070943589ee7',
        nombreCategoria: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      }
      jest.spyOn(mapper, 'mapCategoria').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const categoryResult = await service.create(categoryCreate)

      expect(categoryResult).toBeInstanceOf(Categoria)
      expect(categoryResult.nombreCategoria).toBe(
        categoryCreate.nombreCategoria,
      )
      expect(categoryResult.isDeleted).toBeFalsy()
    })
  })
})
