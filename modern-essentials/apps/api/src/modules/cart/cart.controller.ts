import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ClerkAuthGuard } from "../../common/guards/clerk-auth.guard";
import { AddToCartDto, UpdateCartItemDto } from "./cart.dto";
import { CartService } from "./cart.service";

@Controller("cart")
@UseGuards(ClerkAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post("items")
  async addToCart(
    @CurrentUser() user: any,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(user.id, addToCartDto);
  }

  @Put("items/:itemId")
  async updateCartItem(
    @CurrentUser() user: any,
    @Param("itemId") itemId: string,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(user.id, itemId, updateDto);
  }

  @Delete("items/:itemId")
  async removeFromCart(
    @CurrentUser() user: any,
    @Param("itemId") itemId: string,
  ) {
    return this.cartService.removeFromCart(user.id, itemId);
  }

  @Delete()
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
