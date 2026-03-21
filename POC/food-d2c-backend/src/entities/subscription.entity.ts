import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum SubscriptionInterval {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('subscriptions')
export class Subscription {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ type: 'enum', enum: SubscriptionInterval })
  interval: SubscriptionInterval;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty()
  @Column({ nullable: true })
  razorpaySubscriptionId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  razorpayPlanId?: string;

  @ApiProperty()
  @Column({ nullable: true })
  nextBillingDate?: Date;

  @ApiProperty()
  @Column({ default: 0 })
  totalDeliveries: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.subscription)
  orders: Order[];
}
