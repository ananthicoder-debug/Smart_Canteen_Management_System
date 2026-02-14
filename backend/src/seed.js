require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const FoodItem = require('./models/FoodItem');

const sampleFoods = [
  { name: 'Veggie Wrap', description: 'Fresh veggies in a wrap', price: 4.5, category: 'Wraps', stock: 50 },
  { name: 'Chicken Sandwich', description: 'Grilled chicken sandwich', price: 6.0, category: 'Sandwiches', stock: 30 },
  { name: 'Fries', description: 'Crispy fries', price: 2.5, category: 'Sides', stock: 100 },
  { name: 'Chocolate Cake', description: 'Slice of cake', price: 3.5, category: 'Dessert', stock: 20 }
];

async function seed() {
  await connectDB();
  console.log('Seeding database...');

  // Create staff user (if not exists)
  const staffEmail = process.env.SEED_STAFF_EMAIL || 'staff@food.local';
  const staffPassword = process.env.SEED_STAFF_PASSWORD || 'password123';

  let staff = await User.findOne({ email: staffEmail });
  if (!staff) {
    staff = await User.create({ name: 'Staff User', email: staffEmail, password: staffPassword, role: 'staff' });
    console.log('Created staff user:', staffEmail);
  } else {
    console.log('Staff user already exists:', staffEmail);
  }

  // Insert sample food items (skip duplicates by name)
  for (const f of sampleFoods) {
    const exists = await FoodItem.findOne({ name: f.name });
    if (!exists) {
      await FoodItem.create(f);
      console.log('Added food item:', f.name);
    } else {
      console.log('Food item exists, skipping:', f.name);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
