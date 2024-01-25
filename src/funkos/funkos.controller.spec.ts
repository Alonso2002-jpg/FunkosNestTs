import { Test, TestingModule } from '@nestjs/testing'
import { FunkosController } from './funkos.controller'
import { FunkosService } from './funkos.service'
import { NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { Funko } from './entities/funko.entity'
import { DeleteResult } from 'typeorm'
import { FunkosMapper } from './mapper/funkos.mapper'

describe('FunkosController', () => {
  let controller: FunkosController
  let service: FunkosService

  const funkosServiceMock = {
    findAll: jest.fn(),
    findAllPag: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateImage: jest.fn(),
  }

  const funkosMapper = {
    mapResponse: jest.fn(),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkosController],
      providers: [
        { provide: FunkosService, useValue: funkosServiceMock },
        { provide: FunkosMapper, useValue: funkosMapper },
      ],
    }).compile()

    controller = module.get<FunkosController>(FunkosController)
    service = module.get<FunkosService>(FunkosService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return a response of all funks', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      }
      const testFunkos = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'funkos?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<ResponseFunkoDto>

      jest.spyOn(service, 'findAllPag').mockResolvedValue(testFunkos)

      const result: any = await controller.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `funkos?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
      expect(service.findAllPag).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a response of a funk', async () => {
      const expectedResult: Funko = new Funko()
      jest.spyOn(funkosMapper, 'mapResponse').mockReturnValue(expectedResult)
      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult)

      const actualResult = await controller.findOne(1)
      expect(actualResult).toEqual(expectedResult)
      expect(service.findOne).toHaveBeenCalled()
    })

    it("should throw an error if funk doesn't exist", async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new funk', async () => {
      const createFunkoDto: CreateFunkoDto = {
        name: 'test',
        price: 100,
        quantity: 10,
        category: 'test',
      }
      const expectedResult: Funko = new Funko()

      jest.spyOn(funkosMapper, 'mapResponse').mockReturnValue(expectedResult)
      jest.spyOn(service, 'create').mockResolvedValue(expectedResult)

      const actualResult = await controller.create(createFunkoDto)
      expect(actualResult).toEqual(expectedResult)
      expect(service.create).toHaveBeenCalledWith(createFunkoDto)
      expect(actualResult).toBeInstanceOf(Funko)
    })
  })

  describe('update', () => {
    it('should update a funk', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        name: 'test',
        price: 100,
        quantity: 10,
        category: 'test',
      }
      const expectedResult: Funko = new Funko()

      jest.spyOn(funkosMapper, 'mapResponse').mockReturnValue(expectedResult)
      jest.spyOn(service, 'update').mockResolvedValue(expectedResult)

      const actualResult = await controller.update(1, updateFunkoDto)
      expect(actualResult).toEqual(expectedResult)
      expect(service.update).toHaveBeenCalledWith(1, updateFunkoDto)
      expect(actualResult).toBeInstanceOf(Funko)
    })

    it("should throw an error if funk doesn't exist", () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      expect(controller.remove(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should remove a funk', async () => {
      const delResult = new DeleteResult()

      jest.spyOn(service, 'remove').mockResolvedValue(delResult)

      await controller.remove(1)
      expect(service.remove).toHaveBeenCalledWith(1)
    })

    it('should thrown an error if funk doesn`t exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(1)).rejects.toThrow(NotFoundException)
    })
  })
})
