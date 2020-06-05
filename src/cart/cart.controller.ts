import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { Controller, Post, UseGuards, Body, Request, Get, Req } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {

  constructor(private cartService: CartService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addToCart(@Body('courseId') courseId: string, @Request() req) {
    const addedCourse = await this.cartService.addToCart(courseId, req.user);
    return addedCourse;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req) {
    const allCart = await this.cartService.getCart(req.user);
    return allCart;
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async removeCart(@Request() req, @Body('courseId') courseId) {
    const removeCartId = await this.cartService.removeFromCart(req.user, courseId);
    return removeCartId;
  }

  @Post('moveToWishlist')
  @UseGuards(JwtAuthGuard)
  async moveToWishlist(@Request() req, @Body('courseId') courseId) {
    const moveToWishlistId = await this.cartService.movetowishlist(req.user, courseId);
    return moveToWishlistId;
  }

  @Post('clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Request() req) {
    const removedCart = await this.cartService.clearCartt(req.user);
    return removedCart;
  }

  @Post('order')
  @UseGuards(JwtAuthGuard)
  async order(@Request() req, @Body('courseIds') courseIds) {
    const finishedOrder = await this.cartService.orderr(req.user, courseIds);
    return finishedOrder;
  }

}
