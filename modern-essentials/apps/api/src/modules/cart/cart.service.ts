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
    // User should already be synced by ClerkAuthGuard
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found. Ensure user is synced via ClerkAuthGuard.`);
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
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
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
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
      items: cart.items.map((item: any) => this.mapCartItemToResponse(item)),
      totalItems,
      totalAmount,
    };
  }

  async addToCart(
    userId: string,
    addToCartDto: AddToCartDto,
  ): Promise<CartResponseDto> {
    // Verify variant exists and is active
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: addToCartDto.variantId },
    });

    if (!variant || !variant.isActive) {
      throw new NotFoundException("Product variant not found or not available");
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId_isSubscription: {
          cartId: cart.id,
          variantId: addToCartDto.variantId,
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
          variantId: addToCartDto.variantId,
          quantity: addToCartDto.quantity,
          priceSnapshot: addToCartDto.isSubscription ? variant.subPrice : variant.price, // Store current price
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
      variantId: item.variantId,
      quantity: item.quantity,
      priceSnapshot: item.priceSnapshot,
      isSubscription: item.isSubscription,
      frequency: item.frequency,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        price: item.variant.price,
        subPrice: item.variant.subPrice,
        packSize: item.variant.packSize,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          images: item.variant.product.images.map((img: any) => ({
            url: img.url,
            alt: img.alt,
          })),
        },
      },
    };
  }
}
