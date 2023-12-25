import { Injectable } from '@nestjs/common'
import { CreateCategoriaDto } from '../dto/create-categoria.dto'
import { Categoria } from '../entities/categoria.entity'
import { ResponseCategoriaDto } from '../dto/response-categoria.dto'
import { UpdateCategoriaDto } from '../dto/update-categoria.dto'

@Injectable()
export class CategoriaMapper {
  mapCategoria(createCategoriaDto: CreateCategoriaDto): Categoria {
    const categoria = new Categoria()
    categoria.nombreCategoria = createCategoriaDto.nombreCategoria.toUpperCase()
    categoria.isDeleted = createCategoriaDto.isDeleted || false
    return categoria
  }

  mapCategoriaUpd(
    updateCategoriaDto: UpdateCategoriaDto,
    categoria: Categoria,
  ): Categoria {
    const categoriaReturn = new Categoria()
    categoriaReturn.id = categoria.id
    categoriaReturn.nombreCategoria =
      updateCategoriaDto.nombreCategoria.toUpperCase() ||
      categoria.nombreCategoria
    categoriaReturn.isDeleted =
      updateCategoriaDto.isDeleted == undefined
        ? categoria.isDeleted
        : updateCategoriaDto.isDeleted
    categoriaReturn.createdAt = categoria.createdAt
    return categoriaReturn
  }

  mapResponse(categoria: Categoria): ResponseCategoriaDto {
    const response = new ResponseCategoriaDto()
    response.id = categoria.id
    response.nombreCategoria = categoria.nombreCategoria
    response.isDeleted = categoria.isDeleted
    return response
  }
}
