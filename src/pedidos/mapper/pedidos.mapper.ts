import { Injectable } from '@nestjs/common'
import { CreatePedidoDto } from '../dto/create-pedido.dto'
import { Pedido } from '../entities/pedido.schema'
import { UpdatePedidoDto } from '../dto/update-pedido.dto'
import { ObjectId } from 'typeorm'

@Injectable()
export class PedidosMapper {
  mapToPedido = (pedidoDto: CreatePedidoDto) => {
    const pedido = new Pedido()
    pedido.idUsuario = pedidoDto.idUsuario
    pedido.cliente = {
      nombreCompleto: pedidoDto.cliente.nombreCompleto,
      email: pedidoDto.cliente.email,
      telefono: pedidoDto.cliente.telefono,
      direccion: {
        ciudad: pedidoDto.cliente.direccion.ciudad,
        provincia: pedidoDto.cliente.direccion.provincia,
        numero: pedidoDto.cliente.direccion.numero,
        calle: pedidoDto.cliente.direccion.calle,
        pais: pedidoDto.cliente.direccion.pais,
        codigoPostal: pedidoDto.cliente.direccion.codigoPostal,
      },
    }
    pedido.lineasPedido = pedidoDto.lineasPedido
    return pedido
  }

  mapToPedidoUpd = (pedidoDto: UpdatePedidoDto, pedidoActual: Pedido) => {
    pedidoActual.idUsuario = pedidoDto.idUsuario
      ? pedidoDto.idUsuario
      : pedidoActual.idUsuario
    pedidoActual.cliente = {
      nombreCompleto: pedidoDto.cliente.nombreCompleto
        ? pedidoDto.cliente.nombreCompleto
        : pedidoActual.cliente.nombreCompleto,
      email: pedidoDto.cliente.email
        ? pedidoDto.cliente.email
        : pedidoActual.cliente.email,
      telefono: pedidoDto.cliente.telefono
        ? pedidoDto.cliente.telefono
        : pedidoActual.cliente.telefono,
      direccion: {
        ciudad: pedidoDto.cliente.direccion.ciudad,
        provincia: pedidoDto.cliente.direccion.provincia,
        numero: pedidoDto.cliente.direccion.numero,
        calle: pedidoDto.cliente.direccion.calle,
        pais: pedidoDto.cliente.direccion.pais,
        codigoPostal: pedidoDto.cliente.direccion.codigoPostal,
      },
    }
    pedidoActual.lineasPedido = pedidoDto.lineasPedido
      ? pedidoDto.lineasPedido
      : pedidoActual.lineasPedido
    return pedidoActual
  }
}
