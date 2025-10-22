import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario';
import { Producto } from '../models/Producto';
import { database } from './connection';
import { Logger } from '../utils/helpers';

export class SeedData {
  static async seedUsuarios(): Promise<void> {
    try {
      // Check if admin user already exists
      const existingAdmin = await Usuario.findOne({ where: { email: 'admin@sportsline.com' } });
      
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await Usuario.create({
          nombre: 'Administrador',
          email: 'admin@sportsline.com',
          password: hashedPassword,
          rol: 'admin',
          activo: true
        });
        
        Logger.info('Admin user created successfully');
      } else {
        Logger.info('Admin user already exists');
      }

      // Check if vendor user already exists
      const existingVendor = await Usuario.findOne({ where: { email: 'vendedor@sportsline.com' } });
      
      if (!existingVendor) {
        const hashedPassword = await bcrypt.hash('vendedor123', 10);
        
        await Usuario.create({
          nombre: 'Vendedor Principal',
          email: 'vendedor@sportsline.com',
          password: hashedPassword,
          rol: 'vendedor',
          activo: true
        });
        
        Logger.info('Vendor user created successfully');
      } else {
        Logger.info('Vendor user already exists');
      }
    } catch (error) {
      Logger.error('Error seeding usuarios:', error);
      throw error;
    }
  }

  static async seedProductos(): Promise<void> {
    try {
      const productos = [
        {
          codigo: 'PROD-001',
          nombre: 'Balón de Fútbol Nike',
          descripcion: 'Balón de fútbol oficial Nike, tamaño 5, ideal para partidos profesionales',
          precio: 89.99,
          stock: 50,
          categoria: 'Fútbol',
          activo: true
        },
        {
          codigo: 'PROD-002',
          nombre: 'Raqueta de Tenis Wilson',
          descripcion: 'Raqueta de tenis Wilson Pro Staff, peso 300g, ideal para jugadores avanzados',
          precio: 199.99,
          stock: 25,
          categoria: 'Tenis',
          activo: true
        },
        {
          codigo: 'PROD-003',
          nombre: 'Zapatillas Running Adidas',
          descripcion: 'Zapatillas de running Adidas Ultraboost, tecnología Boost para máximo confort',
          precio: 149.99,
          stock: 40,
          categoria: 'Running',
          activo: true
        }
      ];

      for (const producto of productos) {
        const existingProduct = await Producto.findOne({ where: { codigo: producto.codigo } });
        
        if (!existingProduct) {
          await Producto.create(producto);
          Logger.info(`Product ${producto.codigo} created successfully`);
        } else {
          Logger.info(`Product ${producto.codigo} already exists`);
        }
      }
    } catch (error) {
      Logger.error('Error seeding productos:', error);
      throw error;
    }
  }

  static async runSeeds(): Promise<void> {
    try {
      Logger.info('Starting database seeding...');
      
      // Connect to database
      await database.connect();
      
      // Sync database (create tables if they don't exist)
      await database.sync();
      
      // Seed data
      await this.seedUsuarios();
      await this.seedProductos();
      
      Logger.info('Database seeding completed successfully');
    } catch (error) {
      Logger.error('Error during database seeding:', error);
      throw error;
    } finally {
      // Close database connection
      await database.disconnect();
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  SeedData.runSeeds()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
