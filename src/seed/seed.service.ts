import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';
import { read } from 'fs';

@Injectable()
export class SeedService {
  constructor(private readonly productsServices: ProductsService) {}

  runSeed() {
    this.insertNewProducts();
    return 'SEED EXECUTED';
  }

  private async insertNewProducts() {
    await this.productsServices.deleteAllProducts();
    const { products } = initialData;

    const insertPromises = [];

    // products.forEach((product) => {
    //   insertPromises.push(this.productsServices.create(product));
    // });

    await Promise.all(insertPromises);

    return true;
  }
}
