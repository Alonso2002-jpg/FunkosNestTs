import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoExistsGuard } from './guards/funko-exists.guard'

@Controller('funkos')
@UseGuards(FunkoExistsGuard)
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name)
  constructor(private readonly funkosService: FunkosService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log(`Creando Funko: ${JSON.stringify(createFunkoDto)}`)
    return this.funkosService.create(createFunkoDto)
  }

  @Get()
  async findAll() {
    this.logger.log('Consultando todos los Funkos')
    return await this.funkosService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Consultando Funko: ${id}`)
    return await this.funkosService.findOne(+id)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    this.logger.log(`Actualizando Funko: ${id}`)
    return await this.funkosService.update(+id, updateFunkoDto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando Funko: ${id}`)
    return await this.funkosService.remove(+id)
  }
}
