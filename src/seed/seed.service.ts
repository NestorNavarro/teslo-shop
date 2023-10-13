import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsServices: ProductsService,
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteDB();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'SEED EXECUTED';
  }
  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach((user) => {
      users.push(this.userRespository.create(user));
    });
    const dbUsers = await this.userRespository.save(seedUsers);
    return dbUsers[0];
  }
  private async insertNewProducts(user: User) {
    const { products } = initialData;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productsServices.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
  public async deleteDB() {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
  }
}
