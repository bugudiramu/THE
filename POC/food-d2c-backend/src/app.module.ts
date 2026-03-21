import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { getDatabaseConfig } from './config/database.config';
import { RazorpayConfig } from './config/razorpay.config';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { Subscription } from './entities/subscription.entity';
import { User } from './entities/user.entity';
import { PaymentsModule } from './payments/payments.module';
import { SeedModule } from './seed/seed.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Product, Order, Subscription]),
    AuthModule,
    UsersModule,
    PaymentsModule,
    SubscriptionsModule,
    SeedModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [RazorpayConfig, AppService],
})
export class AppModule {}
