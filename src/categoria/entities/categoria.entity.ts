import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Funko } from '../../funkos/entities/funko.entity'

@Entity('category')
export class Categoria {
  @PrimaryColumn({ type: 'uuid' })
  id: string
  @Column('varchar', {
    length: 255,
    nullable: false,
    unique: true,
    name: 'name_category',
  })
  nombreCategoria: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean

  @OneToMany(() => Funko, (funko) => funko.category)
  funkos: Funko[]
}
