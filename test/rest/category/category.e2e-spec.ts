import { INestApplication, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { Categoria } from '../../../src/categoria/entities/categoria.entity'
import { ResponseCategoriaDto } from '../../../src/categoria/dto/response-categoria.dto'
import { CreateCategoriaDto } from '../../../src/categoria/dto/create-categoria.dto'
import { UpdateCategoriaDto } from '../../../src/categoria/dto/update-categoria.dto'
import { CategoriaController } from '../../../src/categoria/categoria.controller'
import { CategoriaService } from '../../../src/categoria/categoria.service'
import { CategoriaMapper } from '../../../src/categoria/mapper/categoria.mapper'

describe('CategoriasController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/categoria`

  const category: Categoria = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombreCategoria: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  }

  const respondeDTO: ResponseCategoriaDto = {
    id: '14c56c95-1cbf-4c65-a0c3-025899d2e2d1',
    nombreCategoria: 'Test',
    isDeleted: false,
  }

  const createDTO: CreateCategoriaDto = {
    nombreCategoria: 'Test',
  }

  const updateDTO: UpdateCategoriaDto = {
    nombreCategoria: 'New Test',
    isDeleted: true,
  }

  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriaController],
      providers: [
        CategoriaService,
        CategoriaMapper,
        { provide: CategoriaService, useValue: mockCategoriasService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /categorias', () => {
    it('should return an array of categorias response', async () => {
      mockCategoriasService.findAll.mockResolvedValue([respondeDTO])

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([category])
        expect(mockCategoriasService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /categorias/:id', () => {
    it('should return a single category response', async () => {
      mockCategoriasService.findOne.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${respondeDTO.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(category)
        expect(mockCategoriasService.findOne).toHaveBeenCalled()
      })
    })

    it("should throw an error if category doesn't exist", async () => {
      mockCategoriasService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${respondeDTO.id}`)
        .expect(404)
    })
  })

  describe('POST /categorias', () => {
    it('should create a new category', async () => {
      mockCategoriasService.create.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createDTO)
        .expect(201)
      expect(() => {
        expect(body).toEqual(respondeDTO)
        expect(mockCategoriasService.create).toHaveBeenCalledWith(createDTO)
      })
    })
  })

  describe('PUT /categorias/:id', () => {
    it('should update a category', async () => {
      mockCategoriasService.update.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${respondeDTO.id}`)
        .send(updateDTO)
        .expect(200)
      expect(() => {
        expect(body).toEqual(respondeDTO)
        expect(mockCategoriasService.update).toHaveBeenCalledWith(
          respondeDTO.id,
          updateDTO,
        )
      })
    })

    it("should throw an error if the category doesn't exist", async () => {
      mockCategoriasService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${respondeDTO.id}`)
        .send(updateDTO)
        .expect(404)
    })
  })

  describe('DELETE /categorias/:id', () => {
    it('should remove a category', async () => {
      mockCategoriasService.remove.mockResolvedValue(respondeDTO)

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${respondeDTO.id}`)
        .expect(204)
    })

    it("should throw an error if the category doesn't exist", async () => {
      mockCategoriasService.remove.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${respondeDTO.id}`)
        .expect(404)
    })
  })
})
