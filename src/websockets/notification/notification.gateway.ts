import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Notificacion } from './model/notification.model'
import { ResponseFunkoDto } from '../../funkos/dto/response-funko.dto'
import { ResponseCategoriaDto } from '../../categoria/dto/response-categoria.dto'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/nest`
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server
  private readonly logger = new Logger(NotificationGateway.name)

  constructor() {
    this.logger.log(`WebSocketFunkos is listening on ${ENDPOINT}`)
  }

  sendMessage(
    notification: Notificacion<ResponseFunkoDto | ResponseCategoriaDto>,
  ) {
    this.server.emit(
      notification.entity == 'FUNKOS' ? 'funkos' : 'categories',
      notification,
    )
  }
  // Si quiero leer lo que llega y reenviarlo
  /*@SubscribeMessage('updateProduct')
  handleUpdateProduct(client: Socket, data: any) {
    // Aquí puedes manejar la lógica para procesar la actualización del producto
    // y enviar la notificación a todos los clientes conectados
    const notification = {
      message: 'Se ha actualizado un producto',
      data: data,
    }

    this.server.emit('updates', notification)
  }*/

  private handleConnection(client: Socket) {
    // Este método se ejecutará cuando un cliente se conecte al WebSocket
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Updates Notifications WS: Productos - Tienda API NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    // Este método se ejecutará cuando un cliente se desconecte del WebSocket
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
