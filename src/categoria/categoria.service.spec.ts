import { Test, TestingModule } from '@nestjs/testing'
import { CategoriaService } from './categoria.service'
import { DeleteResult, Repository } from 'typeorm'
import { Categoria } from './entities/categoria.entity'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { Funko } from '../funkos/entities/funko.entity'

describe('CategoriaService', () => {
  let service: CategoriaService
  let repository: Repository<Categoria>
  let funkRepository: Repository<Funko>
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
        { provide: getRepositoryToken(Funko), useClass: Repository },
      ],
    }).compile()

    service = module.get<CategoriaService>(CategoriaService)

    repository = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )

    funkRepository = module.get<Repository<Funko>>(getRepositoryToken(Funko))
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
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)

      const categoryResult = await service.create(categoryCreate)

      expect(categoryResult.nombreCategoria).toBe(
        categoryCreate.nombreCategoria,
      )
      expect(categoryResult.isDeleted).toBeFalsy()
    })

    it('should throw an error if the category is already exists', async () => {
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

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)

      await expect(service.create(categoryCreate)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update a category', async () => {
      const category: Categoria = {
        id: '08660c2f-1533-43c2-a6c9-070943589ee7',
        nombreCategoria: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      }
      const categoryUpdate: UpdateCategoriaDto = {
        nombreCategoria: 'test2',
        isDeleted: true,
      }

      const updatedCategory: Categoria = {
        ...category,
        ...categoryUpdate,
        updatedAt: new Date(),
      }
      jest.spyOn(mapper, 'mapCategoriaUpd').mockReturnValue(category)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(updatedCategory)

      const categoryResult = await service.update('123', categoryUpdate)

      expect(categoryResult.nombreCategoria).toBe(
        categoryUpdate.nombreCategoria,
      )
      expect(categoryResult.isDeleted).toBeTruthy()

      expect(mapper.mapCategoriaUpd).toHaveBeenCalled()
      expect(repository.findOneBy).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should throw an error if the category does not exist', async () => {
      const categoryUpdate: UpdateCategoriaDto = {
        nombreCategoria: 'test2',
        isDeleted: true,
      }

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null)

      await expect(service.update('123', categoryUpdate)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('delete', () => {
    it('should delete a category', async () => {
      const categoryTest = new Categoria()
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 1,
      }
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(categoryTest)
      jest.spyOn(funkRepository, 'findBy').mockResolvedValue(null)
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult)

      await service.remove('123')

      expect(repository.findOneBy).toHaveBeenCalled()
      expect(funkRepository.findBy).toHaveBeenCalled()
      expect(repository.delete).toHaveBeenCalled()
    })

    it('should delete a category soft 2', async () => {
      const category: Categoria = new Categoria()
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(funkRepository, 'findBy').mockResolvedValue([new Funko()])
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      await service.remove('123')

      expect(repository.findOneBy).toHaveBeenCalled()
      expect(funkRepository.findBy).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should delete a category soft', async () => {
      const category: Categoria = new Categoria()
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      await service.removeSoft('123')

      expect(repository.findOneBy).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })
  })
})
