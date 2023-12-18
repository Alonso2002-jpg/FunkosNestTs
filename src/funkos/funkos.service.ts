import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkosMapper } from './mapper/funkos.mapper'

@Injectable()
export class FunkosService {
  funkos: Funko[] = []
  private readonly logger: Logger = new Logger(FunkosService.name)
  constructor(private readonly funkosMapper: FunkosMapper) {}
  create(createFunkoDto: CreateFunkoDto) {
    const funkosave = this.funkosMapper.mapFunko(createFunkoDto)
    this.funkos.push(funkosave)
    return this.funkosMapper.mapResponse(funkosave)
  }

  async findAll() {
    return this.funkosMapper.mapResponseList(this.funkos)
  }

  async findOne(id: number) {
    const index = this.funkos.findIndex((f) => f.id === id)
    if (index === -1) {
      throw new NotFoundException(`Funko no encontrado con id:${id}`)
    }
    return this.funkosMapper.mapResponse(this.funkos[index])
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const index = this.funkos.findIndex((f) => f.id == id)
    if (index !== -1) {
      this.funkos[index] = this.funkosMapper.mapFunkoUpd(
        updateFunkoDto,
        this.funkos[index],
      )
      return this.funkosMapper.mapResponse(this.funkos[index])
    } else {
      throw new NotFoundException(`Funko no encontrado con id:${id}`)
    }
  }

  async remove(id: number) {
    const index = this.funkos.findIndex((f) => f.id == id)
    if (index !== -1) {
      const funkDel = this.funkos[index]
      this.funkos.splice(index, 1)
      return this.funkosMapper.mapResponse(funkDel)
    } else {
      throw new NotFoundException(`Funko no encontrado con id:${id}`)
    }
  }
}
