import { Categoria } from '../../categoria/entities/categoria.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('funko')
export class Funko {
  public static IMG_DEFAULT = 'https://via.placeholder.com/150'
  @PrimaryGeneratedColumn()
  id: number
  @Column('varchar', {
    length: 255,
    nullable: false,
    unique: true,
    name: 'name',
  })
  name: string
  @Column('double precision', { nullable: false, unique: false, name: 'price' })
  price?: number
  @Column('integer', { nullable: false, unique: false, name: 'quantity' })
  quantity: number
  @Column('varchar',{nullable: false, unique: false, default: Funko.IMG_DEFAULT })
  img: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date = new Date()
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date = new Date()
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean = false

  @ManyToOne(() => Categoria, (categoria) => categoria.funkos)
  @JoinColumn({ name: 'categoria_id' }) // Especifica el nombre de la columna
  category: Categoria
}
