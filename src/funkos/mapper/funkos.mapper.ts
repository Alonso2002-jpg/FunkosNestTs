import { Injectable } from '@nestjs/common'
import { Funko } from '../entities/funko.entity'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'
import { ResponseFunkoDto } from '../dto/response-funko.dto'
import { Categoria } from '../../categoria/entities/categoria.entity'
@Injectable()
export class FunkosMapper {
  id: number = 1
  mapFunko = (createDto: CreateFunkoDto, category: Categoria): Funko => {
    const funko = new Funko()
    funko.id = this.id
    funko.name = createDto.name
    funko.price = createDto.price
    funko.category = category
    funko.quantity = createDto.quantity
    funko.isDeleted = createDto.isDeleted || false
    funko.createdAt = new Date()
    funko.updatedAt = new Date()
    this.id++
    return funko
  }

  mapFunkoUpd = (
    updateDto: UpdateFunkoDto,
    funkoAct: Funko,
    category?: Categoria,
  ): Funko => {
    const funko = new Funko()
    funko.id = funkoAct.id
    funko.name = updateDto.name || funkoAct.name
    funko.price = updateDto.price || funkoAct.price
    funko.category = category || funkoAct.category
    funko.quantity = updateDto.quantity || funkoAct.quantity
    funko.isDeleted =
      updateDto.isDeleted == undefined
        ? funkoAct.isDeleted
        : updateDto.isDeleted
    return funko
  }

  mapResponse = (funko: Funko): ResponseFunkoDto => {
    const response = new ResponseFunkoDto()
    response.id = funko.id
    response.name = funko.name
    response.price = funko.price
    response.category = funko.category.nombreCategoria
    response.img = funko.img
    response.quantity = funko.quantity
    response.isDeleted = funko.isDeleted
    return response
  }

  mapResponseList = (funkosList: Funko[]): ResponseFunkoDto[] => {
    return funkosList.map(this.mapResponse)
  }
}
