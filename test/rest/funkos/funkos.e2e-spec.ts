import { INestApplication, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { FunkosService } from '../../../src/funkos/funkos.service'
import { FunkosController } from '../../../src/funkos/funkos.controller'
import * as request from 'supertest'
import { CreateFunkoDto } from '../../../src/funkos/dto/create-funko.dto'
import { UpdateFunkoDto } from '../../../src/funkos/dto/update-funko.dto'
import { ResponseFunkoDto } from '../../../src/funkos/dto/response-funko.dto'
import { FunkosMapper } from '../../../src/funkos/mapper/funkos.mapper'

describe('FunkosController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/funkos`

  const respondeDTO: ResponseFunkoDto = {
    id: 1,
    name: 'Test',
    price: 10.0,
    quantity: 10,
    category: 'Test',
    isDeleted: false,
  }

  const createDTO: CreateFunkoDto = {
    name: 'Test',
    price: 10.0,
    quantity: 10,
    category: 'Test',
  }

  const updateDTO: UpdateFunkoDto = {
    name: 'New Test',
  }

  const funkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [
        FunkosService,
        FunkosMapper,
        { provide: FunkosService, useValue: funkosService },
      ],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe(`GET /funkos`, () => {
    it('should return an array of funks response', async () => {
      funkosService.findAll.mockResolvedValue([respondeDTO])

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([respondeDTO])
        expect(funkosService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /funkos/:id', () => {
    it('should return a single funk response', async () => {
      funkosService.findOne.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${respondeDTO.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(respondeDTO)
        expect(funkosService.findOne).toHaveBeenCalled()
      })
    })

    it("should throw an error if the funk doesn't exist", async () => {
      funkosService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${respondeDTO.id}`)
        .expect(404)
    })
  })

  describe('POST /funkos', () => {
    it('should create a new funk', async () => {
      funkosService.create.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createDTO)
        .expect(201)
      expect(() => {
        expect(body).toEqual(respondeDTO)
        expect(funkosService.create).toHaveBeenCalledWith(createDTO)
      })
    })
  })

  describe('PUT /funkos/:id', () => {
    it('should update a funk', async () => {
      funkosService.update.mockResolvedValue(respondeDTO)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${respondeDTO.id}`)
        .send(updateDTO)
        .expect(200)
      expect(() => {
        expect(body).toEqual(respondeDTO)
        expect(funkosService.update).toHaveBeenCalledWith(
          respondeDTO.id,
          updateDTO,
        )
      })
    })

    it("should thrown an error if the funk doesn't exist", async () => {
      funkosService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${respondeDTO.id}`)
        .send(updateDTO)
        .expect(404)
    })
  })

  describe('DELETE /funkos/:id', () => {
    it('should remove a category', async () => {
      funkosService.remove.mockResolvedValue(respondeDTO)

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${respondeDTO.id}`)
        .expect(204)
    })

    it("should throw an error if the funk doesn't exist", async () => {
      funkosService.remove.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${respondeDTO.id}`)
        .expect(404)
    })
  })
})
