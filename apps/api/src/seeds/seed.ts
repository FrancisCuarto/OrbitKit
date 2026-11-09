import mongoose from 'mongoose';
import { config } from '../security/config.js';
import { CategoryModel } from '../models/Category.js';
import { ResourceService } from '../services/resourceService.js';
import { SEED_CATEGORIES, SEED_MANIFESTS } from './seedData.js';

async function seed() {
  console.log('Connecting to MongoDB for seeding...');
  await mongoose.connect(config.MONGODB_URI);

  console.log('Clearing old categories and seeding new categories...');
  await CategoryModel.deleteMany({});
  await CategoryModel.insertMany(SEED_CATEGORIES);
  console.log(`✓ Seeded ${SEED_CATEGORIES.length} categories.`);

  console.log('Registering and validating sample resource manifests...');
  for (const manifest of SEED_MANIFESTS) {
    const result = await ResourceService.registerResourceVersion(
      manifest,
      'Initial verified release'
    );
    console.log(`✓ Seeded resource: ${result.resource.name} (v${result.version})`);
  }

  console.log('Seeding completed successfully!');
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
