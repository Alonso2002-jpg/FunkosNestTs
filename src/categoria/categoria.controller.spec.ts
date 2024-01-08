import { Test, TestingModule } from '@nestjs/testing'
import { CategoriaController } from './categoria.controller'
import { CategoriaService } from './categoria.service'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { ResponseCategoriaDto } from './dto/response-categoria.dto'
import { Categoria } from './entities/categoria.entity'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'

describe('CategoriaController', () => {
  let controller: CategoriaController
  let service: CategoriaService

  const mcCateService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaController],
      providers: [
        CategoriaMapper,
        { provide: CategoriaService, useValue: mcCateService },
      ],
    }).compile()

    controller = module.get<CategoriaController>(CategoriaController)
    service = module.get<CategoriaService>(CategoriaService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of Categoria Response', async () => {
      const categorias: Categoria[] = [new Categoria()]
      jest.spyOn(service, 'findAll').mockResolvedValue(categorias)

      const result = await controller.findAll()
      expect(result.length).toBe(1)
      expect(result[0]).toBeInstanceOf(ResponseCategoriaDto)
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should find and return a Categoria Response', async () => {
      const categoria: Categoria = new Categoria()
      jest.spyOn(service, 'findOne').mockResolvedValue(categoria)

      const result = await controller.findOne('1')
      expect(result).toBeInstanceOf(ResponseCategoriaDto)
      expect(service.findOne).toHaveBeenCalledWith('1')
    })

    it('should throw a NotFoundException if category does not exist', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne('123')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create and return a new Categoria', async () => {
      const categoria: Categoria = new Categoria()
      const cateCreate: CreateCategoriaDto = {
        nombreCategoria: 'test',
      }
      jest.spyOn(service, 'create').mockResolvedValue(categoria)
      jest.spyOn(service, 'findOne').mockResolvedValue(null)

      const result = await controller.create(cateCreate)

      expect(result).toBeInstanceOf(ResponseCategoriaDto)
      expect(service.create).toHaveBeenCalledWith(cateCreate)
      expect(service.findOne).toHaveBeenCalled()
    })

    it('should throw a BadRequestException if category already exists', async () => {
      const cateCreate: CreateCategoriaDto = {
        nombreCategoria: 'test',
      }
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())

      await expect(controller.create(cateCreate)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update and return a Category', async () => {
      const categoria: Categoria = new Categoria()
      const cateUpdate: UpdateCategoriaDto = {
        nombreCategoria: 'test',
      }
      jest.spyOn(service, 'update').mockResolvedValue(categoria)
      jest.spyOn(service, 'findOne').mockResolvedValue(categoria)

      const result = await controller.update('1', cateUpdate)

      expect(result).toBeInstanceOf(ResponseCategoriaDto)
      expect(service.update).toHaveBeenCalledWith('1', cateUpdate)
      expect(service.findOne).toHaveBeenCalledWith('1')
    })

    it('should throw a NotFoundException if category does not exist', async () => {
      const cateUpdate: UpdateCategoriaDto = {
        nombreCategoria: 'test',
      }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException())

      await expect(controller.update('123', cateUpdate)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('remove', () => {
    it('should remove a Category', async () => {
      const categoria: Categoria = new Categoria()
      jest.spyOn(service, 'remove').mockResolvedValue(categoria)

      await controller.remove('1')

      expect(service.remove).toHaveBeenCalledWith('1')
    })

    it('should throw a NotFoundException if category does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())

      await expect(controller.remove('123')).rejects.toThrow(NotFoundException)
    })
  })
})
