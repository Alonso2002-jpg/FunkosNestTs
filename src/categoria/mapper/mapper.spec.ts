import { Test, TestingModule } from '@nestjs/testing'
import { CategoriaMapper } from './categoria.mapper'
import { CreateCategoriaDto } from '../dto/create-categoria.dto'
import { Categoria } from '../entities/categoria.entity'
import { UpdateCategoriaDto } from '../dto/update-categoria.dto'
import { ResponseCategoriaDto } from '../dto/response-categoria.dto'

describe('CategoriasMapper', () => {
  let cateMapper: CategoriaMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaMapper],
    }).compile()

    cateMapper = module.get<CategoriaMapper>(CategoriaMapper)
  })

  it('should be defined', () => {
    expect(cateMapper).toBeDefined()
  })

  it('should map CreateCategoria to Categoria', () => {
    const createCategoriaDto = new CreateCategoriaDto()
    createCategoriaDto.nombreCategoria = 'test'
    const cateEsperada: Categoria = {
      id: '08660c2f-1533-43c2-a6c9-070943589ee7',
      nombreCategoria: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      funkos: [],
    }
    const categoria = cateMapper.mapCategoria(createCategoriaDto)

    expect(categoria.nombreCategoria).toBe(
      cateEsperada.nombreCategoria.toUpperCase(),
    )
  })

  it('should map UpdateCategoria to Categoria', () => {
    const updateCategoria: UpdateCategoriaDto = {
      nombreCategoria: 'test1',
      isDeleted: false,
    }

    const actualCategoria: Categoria = {
      id: '08660c2f-1533-43c2-a6c9-070943589ee7',
      nombreCategoria: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: true,
      funkos: [],
    }

    const categoria = cateMapper.mapCategoriaUpd(
      updateCategoria,
      actualCategoria,
    )
    expect(categoria.nombreCategoria).toBe(
      updateCategoria.nombreCategoria.toUpperCase(),
    )
    expect(categoria.isDeleted).toBeFalsy()
  })

  it('should map Categoria to ResponseCategoriaDto', () => {
    const categoria: Categoria = {
      id: '08660c2f-1533-43c2-a6c9-070943589ee7',
      nombreCategoria: 'test',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      funkos: [],
    }

    const responseCategoriaDto: ResponseCategoriaDto = {
      id: categoria.id,
      nombreCategoria: categoria.nombreCategoria,
      isDeleted: categoria.isDeleted,
    }

    const responseCategoria = cateMapper.mapResponse(categoria)

    expect(responseCategoria.id).toBe(responseCategoriaDto.id)
    expect(responseCategoria.nombreCategoria).toBe(
      responseCategoriaDto.nombreCategoria,
    )
  })
})
