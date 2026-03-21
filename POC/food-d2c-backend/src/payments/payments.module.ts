import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazorpayConfig } from '../config/razorpay.config';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  providers: [PaymentsService, RazorpayConfig],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
