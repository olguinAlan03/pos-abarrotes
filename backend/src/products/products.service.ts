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

  findAll(search?: string, categoryId?: number) {
    const qb = this.productsRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where('p.deletedAt IS NULL');

    if (search) {
      qb.andWhere('LOWER(p.name) LIKE :search OR p.barcode LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    if (categoryId) {
      qb.andWhere('p.categoryId = :categoryId', { categoryId });
    }

    return qb.orderBy('p.name', 'ASC').getMany();
  }

  async findOne(id: number) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
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
    if (dto.barcode) {
      const existing = await this.productsRepo.findOne({
        where: { barcode: dto.barcode },
      });
      if (existing) throw new ConflictException('Barcode already in use');
    }

    const category = await this.categoriesRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    const product = this.productsRepo.create(dto);
    return this.productsRepo.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productsRepo.softRemove(product);
    return { message: 'Product deleted' };
  }
}
