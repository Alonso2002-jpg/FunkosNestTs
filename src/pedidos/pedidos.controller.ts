import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  UseInterceptors,
  Put,
} from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { ObjectId } from 'typeorm'
import { IdValidatePipe } from './pipes/id-validate.pipe'
import { UsuarioExistsGuard } from './guards/user-exists.guard'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('pedidos')
@UseInterceptors(CacheInterceptor) // Aplicar el interceptor aquí de cache
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  @UseGuards(UsuarioExistsGuard)
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto)
  }

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return await this.pedidosService.findAll()
  }

  @Get('usuario/:idUsuario')
  @Roles('ADMIN')
  async findByIdUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return await this.pedidosService.findByIdUsuario(idUsuario)
  }
  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', IdValidatePipe) id: ObjectId) {
    return await this.pedidosService.findOne(id)
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(UsuarioExistsGuard)
  update(
    @Param('id', IdValidatePipe) id: ObjectId,
    @Body() updatePedidoDto: UpdatePedidoDto,
  ) {
    return this.pedidosService.update(id, updatePedidoDto)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  remove(@Param('id', IdValidatePipe) id: ObjectId) {
    return this.pedidosService.remove(id)
  }
}
