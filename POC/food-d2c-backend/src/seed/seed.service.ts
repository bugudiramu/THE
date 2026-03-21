import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async seedUsers() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const testUsers = [
      {
        email: 'john.doe@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+919876543210',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+919876543211',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+919876543212',
        role: UserRole.ADMIN,
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.usersRepository.create(userData);
        await this.usersRepository.save(user);
        console.log(`Created user: ${userData.email}`);
      }
    }
  }

  async seedProducts() {
    const testProducts = [
      {
        name: 'Fresh Organic Vegetables Box',
        description: 'Weekly box of fresh organic vegetables sourced from local farms',
        price: 299.00,
        stock: 100,
        category: 'Vegetables',
        imageUrl: 'https://example.com/vegetables.jpg',
      },
      {
        name: 'Farm Fresh Eggs',
        description: 'Free-range eggs from happy hens',
        price: 120.00,
        stock: 200,
        category: 'Dairy & Eggs',
        imageUrl: 'https://example.com/eggs.jpg',
      },
      {
        name: 'Organic Fruits Basket',
        description: 'Seasonal organic fruits basket',
        price: 399.00,
        stock: 50,
        category: 'Fruits',
        imageUrl: 'https://example.com/fruits.jpg',
      },
      {
        name: 'Artisanal Bread',
        description: 'Freshly baked whole grain bread',
        price: 80.00,
        stock: 30,
        category: 'Bakery',
        imageUrl: 'https://example.com/bread.jpg',
      },
      {
        name: 'Local Honey',
        description: 'Pure raw honey from local beekeepers',
        price: 250.00,
        stock: 40,
        category: 'Pantry',
        imageUrl: 'https://example.com/honey.jpg',
      },
    ];

    for (const productData of testProducts) {
      const existingProduct = await this.productsRepository.findOne({
        where: { name: productData.name },
      });

      if (!existingProduct) {
        const product = this.productsRepository.create(productData);
        await this.productsRepository.save(product);
        console.log(`Created product: ${productData.name}`);
      }
    }
  }

  async seedAll() {
    console.log('Starting database seeding...');
    await this.seedUsers();
    await this.seedProducts();
    console.log('Database seeding completed!');
  }
}
