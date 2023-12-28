import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { Categoria } from './entities/categoria.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { v4 as uuidv4 } from 'uuid'
import { Funko } from '../funkos/entities/funko.entity'

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}
  async create(createCategoriaDto: CreateCategoriaDto) {
    const findCategory = await this.categoriaRepository.findOneBy({
      nombreCategoria: createCategoriaDto.nombreCategoria.toUpperCase(),
    })
    if (findCategory) {
      throw new BadRequestException('La categoria ya existe')
    }
    return await this.categoriaRepository.save({
      ...this.categoriaMapper.mapCategoria(createCategoriaDto),
      id: uuidv4(),
    })
  }

  async findAll() {
    return await this.categoriaRepository.find()
  }

  async findOne(id: string) {
    const cateFind = await this.categoriaRepository.findOneBy({ id })
    if (!cateFind) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`)
    }
    return cateFind
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    const cateFind = await this.findOne(id)
    return await this.categoriaRepository.save(
      this.categoriaMapper.mapCategoriaUpd(updateCategoriaDto, cateFind),
    )
  }

  async remove(id: string) {
    const cateFind = await this.findOne(id)
    const listFunk = await this.funkoRepository.findBy({ category: cateFind })
    if (!listFunk) {
      return await this.categoriaRepository.delete({ id })
    }
    return await this.removeSoft(id)
  }

  async removeSoft(id: string) {
    const cateFind = await this.findOne(id)
    const cateRem: Categoria = {
      ...cateFind,
      updatedAt: new Date(),
      isDeleted: true,
    }
    return await this.categoriaRepository.save(cateRem)
  }
}
