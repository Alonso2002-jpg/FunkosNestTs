import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Funko } from './entities/funko.entity'
import { FunkosMapper } from './mapper/funkos.mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Categoria } from '../categoria/entities/categoria.entity'
import { Repository } from 'typeorm'

@Injectable()
export class FunkosService {
  private readonly logger: Logger = new Logger(FunkosService.name)
  constructor(
    private readonly funkosMapper: FunkosMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {
    this.funkoRepository.delete({})
  }
  async create(createFunkoDto: CreateFunkoDto) {
    const category = await this.findCategory(createFunkoDto.category)
    this.logger.log(category.nombreCategoria)
    const funkosave = this.funkosMapper.mapFunko(createFunkoDto, category)
    return await this.funkoRepository.save(funkosave)
  }

  async findAll() {
    const funkos = await this.funkoRepository.find({ relations: ['category'] })
    funkos.forEach((fk) => this.logger.log(`Funko: ${fk.category}`))
    return funkos
  }

  async findOne(id: number) {
    const funkoFind = await this.funkoRepository.findOne({
      where: { id },
      relations: ['category'],
    })
    if (!funkoFind) {
      throw new NotFoundException(`Funko con ID ${id} no encontrado`)
    }
    return funkoFind
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const funkoFind = await this.findOne(id)
    return await this.funkoRepository.save(
      this.funkosMapper.mapFunkoUpd(
        updateFunkoDto,
        funkoFind,
        updateFunkoDto.category
          ? await this.findCategory(updateFunkoDto.category)
          : undefined,
      ),
    )
  }

  async remove(id: number) {
    await this.findOne(id)
    return await this.funkoRepository.delete({ id })
  }

  async findCategory(name: string) {
    const category = await this.categoriaRepository.findOneBy({
      nombreCategoria: name,
    })
    if (!category) {
      throw new NotFoundException(`Categoria no encontrada con nombre ${name}`)
    }
    return category
  }
}
