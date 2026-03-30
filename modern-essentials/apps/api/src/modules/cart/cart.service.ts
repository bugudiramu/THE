import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import {
  AddToCartDto,
  CartItemResponseDto,
  CartResponseDto,
  UpdateCartItemDto,
} from "./cart.dto";

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string) {
    // Ensure user exists (for testing purposes)
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Create a test user if it doesn't exist
      try {
        await this.prisma.user.create({
          data: {
            id: userId,
            email: `test-${userId}@example.com`,
            phone: `999999${userId.slice(-4)}`, // Use unique phone number
            clerkId: userId,
          },
        });
      } catch (error) {
        // User might already exist, try to find by clerkId instead
        user = await this.prisma.user.findUnique({
          where: { clerkId: userId },
        });
        if (!user) {
          throw error; // Re-throw if it's a different error
        }
      }
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    const totalItems = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    const totalAmount = cart.items.reduce(
      (sum: number, item: any) => sum + item.priceSnapshot * item.quantity,
      0,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items: cart.items.map(this.mapCartItemToResponse),
      totalItems,
      totalAmount,
    };
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // Verify product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: addToCartDto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException("Product not found or not available");
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart (now matching on productId AND isSubscription)
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_isSubscription: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          isSubscription: addToCartDto.isSubscription || false,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { 
          quantity: existingItem.quantity + addToCartDto.quantity,
          frequency: addToCartDto.frequency as any || existingItem.frequency,
        },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: addToCartDto.productId,
          quantity: addToCartDto.quantity,
          priceSnapshot: product.price, // Store current price
          isSubscription: addToCartDto.isSubscription || false,
          frequency: addToCartDto.frequency as any,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    // Verify item belongs to user's cart
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (updateDto.quantity === 0) {
      // Remove item if quantity is 0
      await this.prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: updateDto.quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeFromCart(
    userId: string,
    itemId: string,
  ): Promise<CartResponseDto> {
    // Verify item belongs to user's cart
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }

  private mapCartItemToResponse(item: any): CartItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      isSubscription: item.isSubscription,
      frequency: item.frequency,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        sku: item.product.sku,
        price: item.product.price,
        images: item.product.images.map((img: any) => ({
          url: img.url,
          alt: img.alt,
        })),
      },
    };
  }
}
