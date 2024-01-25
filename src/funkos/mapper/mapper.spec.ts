import { Test, TestingModule } from '@nestjs/testing'
import { FunkosMapper } from './funkos.mapper'
import { Categoria } from '../../categoria/entities/categoria.entity'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { Funko } from '../entities/funko.entity'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { ResponseFunkoDto } from '../dto/response-funko.dto'
import { StorageService } from '../../storage/storage.service'

describe('Mapper', () => {
  let provider: FunkosMapper

  const category: Categoria = {
    id: '08660c2f-1533-43c2-a6c9-070943589ee7',
    nombreCategoria: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  }

  const funkoAct: Funko = {
    id: 1,
    name: 'test',
    price: 10,
    quantity: 10,
    img: 'https://via.placeholder.com/150',
    category: category,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkosMapper, StorageService],
    }).compile()

    provider = module.get<FunkosMapper>(FunkosMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  it('should map a CreateFunkoDTO to Funko', () => {
    const createFunkoDto: CreateFunkoDto = {
      name: 'test',
      price: 10,
      quantity: 10,
      category: 'test',
      isDeleted: false,
    }

    const funko = provider.mapFunko(createFunkoDto, category)

    expect(funko.category.nombreCategoria).toBe(createFunkoDto.category)
    expect(funko).toBeInstanceOf(Funko)
  })

  it('should map a UPDFunkoDTO to Funko', () => {
    const updateFunkoDto: UpdateFunkoDto = {
      name: 'testnew',
    }

    const funko = provider.mapFunkoUpd(updateFunkoDto, funkoAct, category)

    expect(funko.name).toBe(updateFunkoDto.name)
    expect(funko).toBeInstanceOf(Funko)
  })

  it('should map a ResponseFunkoDTO to Funko', () => {
    const res = provider.mapResponse(funkoAct)

    expect(res).toBeInstanceOf(ResponseFunkoDto)
    expect(res.name).toBe(funkoAct.name)
  })

  it('should map a list of Funkos to ResponseFunkoDTO', () => {
    const res = provider.mapResponseList([funkoAct])

    expect(res).toBeInstanceOf(Array)
    expect(res[0]).toBeInstanceOf(ResponseFunkoDto)
  })
})
