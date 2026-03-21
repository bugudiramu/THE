import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seedData() {
    await this.seedService.seedUsers();
    await this.seedService.seedProducts();
    return {
      message: 'Database seeded successfully!',
      users: 'Test users created',
      products: 'Test products created',
    };
  }
}
