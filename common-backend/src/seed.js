require('dotenv').config();
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const User = require('./models/User');
const KioskUser = require('./models/KioskUser');
const Product = require('./models/Product');
const Menu = require('./models/Menu');

const dataPath = path.resolve(__dirname, '..', '..', 'Kisok-Management-System', 'data.json');

const defaultUsers = {
  admin: {
    name: 'Admin User',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@innowah.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  },
  staff: {
    name: 'Staff User',
    email: process.env.SEED_STAFF_EMAIL || 'staff@innowah.local',
    password: process.env.SEED_STAFF_PASSWORD || 'password123',
    role: 'staff',
  },
  student: {
    name: 'Student User',
    email: process.env.SEED_STUDENT_EMAIL || 'student@innowah.local',
    password: process.env.SEED_STUDENT_PASSWORD || 'password123',
    role: 'student',
    collegeId: process.env.SEED_STUDENT_COLLEGE_ID || 'CSTU001',
  },
};

const defaultKioskUser = {
  admissionNumber: process.env.SEED_KIOSK_ADMISSION || 'ADM001',
  name: 'Kiosk User',
  department: 'CSE',
  wallet_balance: 500,
  password: process.env.SEED_KIOSK_PASSWORD || 'kiosk123',
  role: 'user',
  email: process.env.SEED_KIOSK_EMAIL || 'kiosk@innowah.local',
};

// Sample kiosk users with RFID card UIDs for testing
const sampleKioskUsers = [
  {
    admissionNumber: 'STU001',
    name: 'Blue Tag User',
    department: 'CSE',
    uid: '517D7E00', // Blue tag UID
    wallet_balance: 1000,
    password: 'student123',
    role: 'user',
    email: 'stu001@college.local',
  },
  {
    admissionNumber: 'STU002',
    name: 'White Card User',
    department: 'CSE',
    uid: '8FDA8A1F', // White card UID
    wallet_balance: 1000,
    password: 'student123',
    role: 'user',
    email: 'stu002@college.local',
  },
  {
    admissionNumber: 'STU003',
    name: 'Student ID User',
    department: 'ECE',
    uid: 'F300A4EC', // Student ID UID
    wallet_balance: 1000,
    password: 'student123',
    role: 'user',
    email: 'stu003@college.local',
  },
];

async function seedUsers() {
  const admin = await User.findOne({ email: defaultUsers.admin.email });
  if (!admin) {
    await User.create(defaultUsers.admin);
    console.log('Created admin user:', defaultUsers.admin.email);
  } else {
    console.log('Admin user already exists:', defaultUsers.admin.email);
  }

  const staff = await User.findOne({ email: defaultUsers.staff.email });
  if (!staff) {
    await User.create(defaultUsers.staff);
    console.log('Created staff user:', defaultUsers.staff.email);
  } else {
    console.log('Staff user already exists:', defaultUsers.staff.email);
  }

  const student = await User.findOne({ email: defaultUsers.student.email });
  if (!student) {
    await User.create(defaultUsers.student);
    console.log('Created student user:', defaultUsers.student.email);
  } else {
    console.log('Student user already exists:', defaultUsers.student.email);
  }

  const kiosk = await KioskUser.findOne({ admissionNumber: defaultKioskUser.admissionNumber });
  if (!kiosk) {
    await KioskUser.create(defaultKioskUser);
    console.log('Created kiosk user:', defaultKioskUser.admissionNumber);
  } else {
    console.log('Kiosk user already exists:', defaultKioskUser.admissionNumber);
  }

  // Seed sample kiosk users with RFID card UIDs
  for (const sampleUser of sampleKioskUsers) {
    const existing = await KioskUser.findOne({ admissionNumber: sampleUser.admissionNumber });
    if (!existing) {
      await KioskUser.create(sampleUser);
      console.log(`Created sample kiosk user: ${sampleUser.admissionNumber} (UID: ${sampleUser.uid})`);
    } else {
      console.log(`Sample user already exists: ${sampleUser.admissionNumber}`);
    }
  }
}

async function seedMenu() {
  let items = [];
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    items = JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read kiosk data.json, skipping product seed:', err.message);
    return;
  }

  for (const item of items) {
    const existing = await Product.findOne({ name: item.name });
    let product = existing;
    if (!existing) {
      product = await Product.create({
        name: item.name,
        price: item.price,
        quantity: item.quantity ?? 0,
        description: item.description,
        image: item.image,
        category: item.category,
        ingredients: item.ingredients,
        allergens: item.allergens,
      });
      console.log('Added product:', product.name);
    } else {
      console.log('Product exists, skipping:', existing.name);
    }

    const menuExists = await Menu.findOne({ product: product._id });
    if (!menuExists) {
      await Menu.create({
        product: product._id,
        available: true,
        prepTime: 10,
        canteenId: 'canteen-1',
      });
      console.log('Added menu item for product:', product.name);
    } else {
      console.log('Menu item exists, skipping:', product.name);
    }
  }
}

async function seed() {
  await connectDB();
  console.log('Seeding database...');
  await seedUsers();
  await seedMenu();
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
