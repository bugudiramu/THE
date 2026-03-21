import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RazorpayConfig {
  constructor(private configService: ConfigService) {}

  get keyId(): string {
    return this.configService.get<string>('RAZORPAY_KEY_ID') || '';
  }

  get keySecret(): string {
    return this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
  }
}
