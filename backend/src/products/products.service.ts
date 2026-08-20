import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Category) private categoriesRepo: Repository<Category>,
  ) {}

  findAllCategories() {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.categoriesRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Category already exists');
    const category = this.categoriesRepo.create(dto);
    return this.categoriesRepo.save(category);
  }

  findAll(search?: string, categoryKey?: string) {
    const qb = this.productsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c');

    if (search) {
      qb.andWhere('LOWER(p.name) LIKE :search OR p.barcode LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    if (categoryKey) {
      qb.andWhere('p.category_key = :categoryKey', { categoryKey });
    }

    return qb.orderBy('p.name', 'ASC').getMany();
  }

  async findOne(productKey: string) {
    const product = await this.productsRepo.findOne({
      where: { product_key: productKey },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${productKey} not found`);
    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.productsRepo.findOne({
      where: { barcode },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException(`Product with barcode ${barcode} not found`);
    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.productsRepo.findOne({
      where: { barcode: dto.barcode },
    });
    if (existing) throw new ConflictException('Barcode already in use');

    const category = await this.categoriesRepo.findOne({
      where: { category_key: dto.categoryKey },
    });
    if (!category) throw new NotFoundException('Category not found');

    const product = this.productsRepo.create({
      name: dto.name,
      barcode: dto.barcode,
      price: dto.price,
      cost: dto.cost,
      stock: dto.stock,
      category_key: dto.categoryKey,
    });
    return this.productsRepo.save(product);
  }

  async update(productKey: string, dto: UpdateProductDto) {
    const product = await this.findOne(productKey);
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.barcode !== undefined) product.barcode = dto.barcode;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.cost !== undefined) product.cost = dto.cost;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.categoryKey !== undefined) product.category_key = dto.categoryKey;
    return this.productsRepo.save(product);
  }

  async remove(productKey: string) {
    const product = await this.findOne(productKey);
    await this.productsRepo.remove(product);
    return { message: 'Product deleted' };
  }
}
