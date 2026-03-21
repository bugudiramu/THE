import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { User } from './user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => User)
  user: User;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @ManyToOne(() => Subscription, (subscription) => subscription.orders, {
    nullable: true,
  })
  subscription?: Subscription;

  @ApiProperty()
  @Column({ nullable: true })
  subscriptionId?: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  items: any[];

  @ApiProperty()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @Column({ nullable: true })
  razorpayOrderId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  razorpayPaymentId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  deliveryDate?: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
