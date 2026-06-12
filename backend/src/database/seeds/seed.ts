import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AuthService } from '../../auth/auth.service';
import { ProductsService } from '../../products/products.service';
import { InventoryService } from '../../inventory/inventory.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const productsService = app.get(ProductsService);
  const inventoryService = app.get(InventoryService);

  console.log('Seeding admin user...');
  try {
    await authService.createUser('admin', 'admin123', 'admin');
    console.log('Admin created: admin / admin123');
  } catch {
    console.log('Admin already exists, skipping.');
  }

  console.log('Seeding categories...');
  const categoryNames = [
    'Bebidas',
    'Abarrotes',
    'Lácteos',
    'Carnes',
    'Frutas y Verduras',
    'Limpieza',
    'Botanas',
  ];

  const categories: { id: number; name: string }[] = [];
  for (const name of categoryNames) {
    try {
      const cat = await productsService.createCategory({ name });
      categories.push(cat);
      console.log(`  Category: ${name}`);
    } catch {
      console.log(`  Category ${name} already exists, skipping.`);
    }
  }

  if (categories.length > 0) {
    console.log('Seeding sample products...');
    const sampleProducts = [
      { name: 'Coca Cola 600ml', barcode: '7501055300051', price: 1500, cost: 1000, categoryId: categories[0]?.id ?? 1 },
      { name: 'Agua Ciel 1L', barcode: '7501055321940', price: 1200, cost: 700, categoryId: categories[0]?.id ?? 1 },
      { name: 'Arroz 1kg', barcode: '7501234567890', price: 2500, cost: 1800, categoryId: categories[1]?.id ?? 2 },
      { name: 'Leche Lala 1L', barcode: '7501021009001', price: 2200, cost: 1600, categoryId: categories[2]?.id ?? 3 },
    ];

    for (const p of sampleProducts) {
      try {
        const product = await productsService.create(p);
        await inventoryService.ensureStockExists(product.id);
        await inventoryService.manualAdjustment(product.id, 50, 'Initial stock seed');
        console.log(`  Product: ${p.name}`);
      } catch {
        console.log(`  Product ${p.name} already exists, skipping.`);
      }
    }
  }

  await app.close();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
