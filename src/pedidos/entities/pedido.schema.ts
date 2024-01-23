import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm'

export class Direccion {
  @Column()
  calle: string

  @Column()
  numero: string

  @Column()
  ciudad: string

  @Column()
  provincia: string

  @Column()
  pais: string

  @Column()
  codigoPostal: string
}

export class Cliente {
  @Column()
  nombreCompleto: string

  @Column()
  email: string

  @Column()
  telefono: string

  @Column(() => Direccion)
  direccion: Direccion
}

export class LineaPedido {
  @Column()
  idProducto: number

  @Column()
  precioProducto: number

  @Column()
  cantidad: number

  @Column()
  total: number
}

@Entity('pedidos')
export class Pedido {
  @ObjectIdColumn()
  _id: ObjectId

  @Column({ name: 'idBusqueda', type: 'varchar2' })
  idBusqueda: string

  @Column({ name: 'idUsuario', type: 'bigint' })
  idUsuario: number

  @Column(() => Cliente)
  cliente: Cliente

  @Column(() => LineaPedido)
  lineasPedido: LineaPedido[]

  @Column({ type: 'int' })
  totalItems: number

  @Column({ type: 'double' })
  total: number

  @CreateDateColumn({ type: 'timestamp', name: 'createdAt' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', name: 'updatedAt' })
  updatedAt: Date

  @Column({ type: 'boolean' })
  isDeleted: boolean
}
