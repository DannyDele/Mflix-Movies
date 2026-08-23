/**
 * Seed script — populates MongoDB with realistic ecommerce admin data
 * covering every admin endpoint the frontend needs.
 *
 * Run: npm run seed
 */
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });
if (!process.env.MONGO_URI) require("dotenv").config({ path: ".env" });

const mongoose = require("mongoose");
const Product = require("../features/products/products.model");
const Customer = require("../features/customers/customers.model");
const Order = require("../features/orders/orders.model");
const Coupon = require("../features/discounts/discounts.model");
const Review = require("../features/reviews/reviews.model");
const { StockLog } = require("../features/inventory/inventory.model");
const {
  NotificationLog,
  NotificationSettings,
} = require("../features/notifications/notifications.model");
const { DEFAULT_PREFERENCES } = require("../features/notifications/notifications.constants");
const Admin = require("../features/auth/auth.model");
const authService = require("../features/auth/auth.service");
const settingsService = require("../features/settings/settings.service");
const { PRODUCT_CATEGORIES, PRODUCT_STATUS } = require("../features/products/products.constants");
const { PAYMENT_STATUS, FULFILLMENT_STATUS } = require("../shared/constants/orderStatus");
const { PERMISSIONS, PERMISSION_LIST } = require("../shared/constants/permissions");

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Logan",
  "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
];
const LAST_NAMES = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson",
  "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
];
const CITIES = [
  { city: "New York", state: "NY" },
  { city: "Los Angeles", state: "CA" },
  { city: "Chicago", state: "IL" },
  { city: "Houston", state: "TX" },
  { city: "Phoenix", state: "AZ" },
  { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" },
  { city: "Miami", state: "FL" },
  { city: "Boston", state: "MA" },
  { city: "Austin", state: "TX" },
];

const PRODUCT_CATALOG = [
  { name: "Wireless Noise-Canceling Headphones", category: "Electronics", price: 249.99 },
  { name: "Organic Cotton Crew T-Shirt", category: "Clothing", price: 29.99 },
  { name: "Smart Home Hub Pro", category: "Electronics", price: 129.0 },
  { name: "Trail Running Shoes Pro", category: "Footwear", price: 139.5 },
  { name: "Ceramic Pour-Over Mug Set", category: "Home & Garden", price: 42.0 },
  { name: "Premium Yoga Mat", category: "Sports", price: 58.0 },
  { name: "Bluetooth Mini Speaker", category: "Electronics", price: 49.99 },
  { name: "Classic Leather Wallet", category: "Accessories", price: 64.0 },
  { name: "Insulated Steel Water Bottle", category: "Sports", price: 34.5 },
  { name: "Adjustable LED Desk Lamp", category: "Home & Garden", price: 45.0 },
  { name: "Fitness Tracker Band X2", category: "Electronics", price: 89.99 },
  { name: "Linen Throw Pillow Cover", category: "Home & Garden", price: 24.0 },
  { name: "20W Portable Phone Charger", category: "Electronics", price: 39.99 },
  { name: "Bamboo Cutting Board Set", category: "Home & Garden", price: 36.0 },
  { name: "Silk Scarf Collection", category: "Accessories", price: 55.0 },
  { name: "RGB Mechanical Keyboard", category: "Electronics", price: 119.0 },
  { name: "Insulated Lunch Box", category: "Food & Beverage", price: 28.5 },
  { name: "Vintage Denim Jacket", category: "Clothing", price: 98.0 },
  { name: "Essential Oil Diffuser", category: "Beauty", price: 44.0 },
  { name: "Camping Hammock Lite", category: "Sports", price: 62.0 },
  { name: "Ergo Wireless Mouse", category: "Electronics", price: 35.99 },
  { name: "Ceramic Mid-Century Plant Pot", category: "Home & Garden", price: 22.0 },
  { name: "Polarized Aviator Sunglasses", category: "Accessories", price: 79.0 },
  { name: "Memory Foam Travel Pillow", category: "Home & Garden", price: 32.0 },
  { name: "Cast Iron Skillet 12in", category: "Home & Garden", price: 54.0 },
  { name: "40L Hiking Backpack", category: "Sports", price: 110.0 },
  { name: "Aromatherapy Candle Trio", category: "Beauty", price: 38.0 },
  { name: "Kids Wooden Building Blocks", category: "Toys", price: 45.0 },
  { name: "Protein Shaker Bottle", category: "Sports", price: 16.99 },
  { name: "Minimalist Wall Clock", category: "Home & Garden", price: 48.0 },
  { name: "Hydrating Face Serum", category: "Beauty", price: 52.0 },
  { name: "Classic Fiction Bundle (3 books)", category: "Books", price: 41.0 },
  { name: "Canvas Tote Bag", category: "Accessories", price: 27.0 },
  { name: "Performance Running Socks (3-pack)", category: "Footwear", price: 19.99 },
  { name: "Cold Brew Coffee Maker", category: "Food & Beverage", price: 46.0 },
  { name: "Resistance Bands Set", category: "Sports", price: 24.99 },
  { name: "Wool Beanie", category: "Clothing", price: 22.5 },
  { name: "USB-C Hub Multiport", category: "Electronics", price: 59.0 },
  { name: "Scented Body Wash Duo", category: "Beauty", price: 28.0 },
  { name: "Board Game Night Pack", category: "Toys", price: 67.0 },
];

const REVIEW_COMMENTS = [
  "Great product, fast shipping!",
  "Exactly as described. Would buy again.",
  "Good quality but sizing runs small.",
  "Not worth the price in my opinion.",
  "Amazing! Exceeded my expectations.",
  "Decent product for the price point.",
  "Packaging was excellent and arrived early.",
  "Customer support helped resolve my issue quickly.",
  "Color is slightly different from the photos.",
  "Solid build quality — using it daily.",
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function clearCollections() {
  await Promise.all([
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    StockLog.deleteMany({}),
    NotificationLog.deleteMany({}),
    NotificationSettings.deleteMany({}),
    Admin.deleteMany({}),
  ]);
}

async function seedTeam() {
  await authService.seedDefaultAdmin();
  await Admin.create([
    {
      name: "Maya Chen",
      email: "manager@store.com",
      password: "Manager@123",
      isSuperAdmin: false,
      isAdmin: true,
      permissions: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_MANAGE,
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_MANAGE,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.INVENTORY_MANAGE,
        PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.ADMINS_VIEW,
      ],
    },
    {
      name: "Jordan Lee",
      email: "support@store.com",
      password: "Support@123",
      isSuperAdmin: false,
      isAdmin: true,
      permissions: [
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.CUSTOMERS_MANAGE,
        PERMISSIONS.REVIEWS_VIEW,
        PERMISSIONS.REVIEWS_MANAGE,
        PERMISSIONS.NOTIFICATIONS_VIEW,
      ],
    },
  ]);
  console.log("Seeded 3 admin users (super admin + 2 admins with permissions)");
}

async function seedProducts() {
  const products = [];
  for (let i = 0; i < PRODUCT_CATALOG.length; i++) {
    const item = PRODUCT_CATALOG[i];
    const stock = i % 8 === 0 ? 0 : i % 5 === 0 ? randomInt(1, 8) : randomInt(15, 200);
    const status =
      stock === 0
        ? PRODUCT_STATUS.OUT_OF_STOCK
        : i % 7 === 0
          ? PRODUCT_STATUS.DRAFT
          : PRODUCT_STATUS.ACTIVE;

    const sku = `SKU-${String(i + 1).padStart(4, "0")}`;
    const product = await Product.create({
      name: item.name,
      description: `${item.name} — carefully selected for everyday quality and lasting performance.`,
      sku,
      category: PRODUCT_CATEGORIES.includes(item.category) ? item.category : "Accessories",
      price: item.price,
      compareAtPrice: i % 3 === 0 ? Math.round((item.price + 15) * 100) / 100 : null,
      stock,
      lowStockThreshold: 10,
      tags: i % 2 === 0 ? ["featured"] : i % 3 === 0 ? ["bestseller", "new"] : ["everyday"],
      images: [],
      variants: [
        { size: "S", color: "Black", sku: `${sku}-BK-S`, stock: Math.floor(stock / 3) },
        { size: "M", color: "Black", sku: `${sku}-BK-M`, stock: Math.floor(stock / 3) },
        { size: "L", color: "White", sku: `${sku}-WH-L`, stock: Math.ceil(stock / 3) },
      ],
      status,
      totalSold: randomInt(0, 600),
      createdAt: daysAgo(randomInt(10, 120)),
    });
    products.push(product);
  }
  console.log(`Seeded ${products.length} products`);
  return products;
}

async function seedCustomers() {
  const customers = [];
  for (let i = 0; i < 40; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const loc = random(CITIES);
    const customer = await Customer.create({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@email.com`,
      phone: `+1 555-${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
      status: i % 11 === 0 ? "blocked" : "active",
      totalOrders: 0,
      totalSpent: 0,
      joinDate: daysAgo(randomInt(5, 365)),
      notes:
        i % 6 === 0
          ? [{ note: "Prefers email contact over phone.", by: "Super Admin", at: daysAgo(3) }]
          : [],
      addresses: [
        {
          label: "Home",
          fullName: `${first} ${last}`,
          line1: `${randomInt(100, 9999)} ${random(["Main", "Oak", "Pine", "Cedar"])} Street`,
          city: loc.city,
          state: loc.state,
          postalCode: String(randomInt(10000, 99999)),
          country: "US",
          phone: `+1 555-${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
          isDefault: true,
        },
      ],
    });
    customers.push(customer);
  }
  console.log(`Seeded ${customers.length} customers`);
  return customers;
}

async function seedOrders(products, customers) {
  const paymentMethods = ["card", "paypal", "apple_pay", "cod"];
  const fulfillmentStatuses = Object.values(FULFILLMENT_STATUS);
  const paymentStatuses = Object.values(PAYMENT_STATUS);
  const customerSpend = {};

  for (let i = 0; i < 60; i++) {
    const customer = customers[i % customers.length];
    const itemCount = randomInt(1, 4);
    const selected = [];
    for (let j = 0; j < itemCount; j++) selected.push(random(products));

    const items = selected.map((p) => ({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      quantity: randomInt(1, 3),
      price: p.price,
      image: null,
      variant: { size: random(["S", "M", "L"]), color: random(["Black", "White"]) },
    }));

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 75 ? 0 : 5.99;
    const discount = i % 4 === 0 ? randomInt(5, 25) : 0;
    const total = Math.max(0, Math.round((subtotal + tax + shipping - discount) * 100) / 100);
    const createdAt = daysAgo(randomInt(0, 90));
    const fulfillmentStatus = random(fulfillmentStatuses);
    const paymentStatus =
      fulfillmentStatus === "cancelled"
        ? PAYMENT_STATUS.FAILED
        : fulfillmentStatus === "refunded"
          ? PAYMENT_STATUS.REFUNDED
          : random([PAYMENT_STATUS.PAID, PAYMENT_STATUS.PAID, PAYMENT_STATUS.PAID, PAYMENT_STATUS.PENDING]);

    const refundAmount =
      paymentStatus === PAYMENT_STATUS.REFUNDED
        ? total
        : paymentStatus === PAYMENT_STATUS.PARTIALLY_REFUNDED
          ? Math.round(total * 0.4 * 100) / 100
          : 0;

    await Order.create({
      orderNumber: `ORD-${String(i + 1).padStart(5, "0")}`,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      itemCount: items.reduce((s, it) => s + it.quantity, 0),
      subtotal,
      tax,
      shipping,
      discount,
      total,
      paymentStatus,
      fulfillmentStatus,
      paymentMethod: random(paymentMethods),
      shippingAddress: customer.addresses[0],
      billingAddress: customer.addresses[0],
      internalNotes:
        i % 5 === 0 ? [{ note: "Customer requested gift wrap.", by: "Maya Chen", at: createdAt }] : [],
      timeline: [
        { action: "Order placed", by: "system", at: createdAt },
        ...(fulfillmentStatus !== "pending"
          ? [{ action: `Status set to ${fulfillmentStatus}`, by: "Super Admin", at: daysAgo(randomInt(0, 5)) }]
          : []),
      ],
      refundAmount,
      createdAt,
      updatedAt: createdAt,
    });

    const key = customer._id.toString();
    if (!customerSpend[key]) customerSpend[key] = { orders: 0, spent: 0 };
    customerSpend[key].orders += 1;
    if (paymentStatus === PAYMENT_STATUS.PAID || paymentStatus === PAYMENT_STATUS.PARTIALLY_REFUNDED) {
      customerSpend[key].spent += total - refundAmount;
    }
  }

  for (const [id, stats] of Object.entries(customerSpend)) {
    await Customer.findByIdAndUpdate(id, {
      totalOrders: stats.orders,
      totalSpent: Math.round(stats.spent * 100) / 100,
    });
  }
  console.log("Seeded 60 orders and updated customer totals");
}

async function seedInventoryLogs(products) {
  let count = 0;
  for (const product of products.slice(0, 25)) {
    const previous = Math.max(0, product.stock - 20);
    await StockLog.create({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      type: "restock",
      quantityChange: 20,
      previousStock: previous,
      newStock: previous + 20,
      note: "Weekly warehouse restock",
      by: "Maya Chen",
      createdAt: daysAgo(randomInt(1, 30)),
    });
    count += 1;

    if (product.stock < 15) {
      await StockLog.create({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        type: "adjustment",
        quantityChange: -2,
        previousStock: product.stock + 2,
        newStock: product.stock,
        note: "Damaged units removed",
        by: "Jordan Lee",
        createdAt: daysAgo(randomInt(0, 10)),
      });
      count += 1;
    }
  }
  console.log(`Seeded ${count} inventory stock logs`);
}

async function seedCoupons() {
  const coupons = [
    {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      usageLimit: 100,
      usageCount: 34,
      minOrderAmount: 0,
      startsAt: daysAgo(60),
      expiresAt: new Date("2026-12-31"),
      status: "active",
      description: "10% off for new customers",
    },
    {
      code: "SAVE20",
      type: "flat",
      value: 20,
      usageLimit: 50,
      usageCount: 50,
      minOrderAmount: 50,
      startsAt: daysAgo(90),
      expiresAt: daysAgo(5),
      status: "expired",
      description: "$20 off orders over $50",
    },
    {
      code: "SUMMER25",
      type: "percentage",
      value: 25,
      usageLimit: 200,
      usageCount: 12,
      startsAt: daysAgo(10),
      expiresAt: new Date("2026-09-01"),
      status: "active",
      description: "Summer sale 25% off",
      applicableCategories: ["Clothing", "Footwear", "Sports"],
    },
    {
      code: "FREESHIP",
      type: "flat",
      value: 5.99,
      usageLimit: null,
      usageCount: 88,
      startsAt: daysAgo(30),
      expiresAt: new Date("2026-12-31"),
      status: "active",
      description: "Free standard shipping",
    },
    {
      code: "VIP50",
      type: "flat",
      value: 50,
      usageLimit: 10,
      usageCount: 3,
      minOrderAmount: 200,
      startsAt: daysAgo(5),
      expiresAt: new Date("2026-08-15"),
      status: "active",
      description: "VIP $50 off $200+",
    },
    {
      code: "FALL15",
      type: "percentage",
      value: 15,
      usageLimit: 300,
      usageCount: 0,
      startsAt: new Date("2026-09-01"),
      expiresAt: new Date("2026-11-30"),
      status: "scheduled",
      description: "Fall promo — scheduled",
    },
    {
      code: "FLASH30",
      type: "percentage",
      value: 30,
      usageLimit: 25,
      usageCount: 8,
      startsAt: daysAgo(2),
      expiresAt: daysAgo(-2),
      status: "active",
      description: "Flash sale 30% off",
    },
    {
      code: "BDAY10",
      type: "flat",
      value: 10,
      usageLimit: 500,
      usageCount: 41,
      startsAt: daysAgo(100),
      expiresAt: new Date("2026-12-31"),
      status: "active",
      description: "Birthday gift coupon",
    },
  ];
  await Coupon.insertMany(coupons);
  console.log(`Seeded ${coupons.length} coupons`);
}

async function seedReviews(products, customers) {
  const statuses = ["pending", "published", "published", "published", "flagged", "rejected"];
  for (let i = 0; i < 50; i++) {
    const product = random(products);
    const customer = random(customers);
    await Review.create({
      productId: product._id,
      productName: product.name,
      customerId: customer._id,
      customerName: customer.name,
      rating: randomInt(1, 5),
      comment: random(REVIEW_COMMENTS),
      status: random(statuses),
      createdAt: daysAgo(randomInt(0, 60)),
    });
  }
  console.log("Seeded 50 reviews");
}

async function seedNotifications() {
  await NotificationSettings.create({
    masterPushEnabled: true,
    preferences: DEFAULT_PREFERENCES,
  });

  const types = [
    "new_order",
    "low_stock",
    "payment_failed",
    "new_review",
    "refund_requested",
    "daily_summary",
    "weekly_summary",
    "new_signup",
  ];
  const titles = {
    new_order: "New order received",
    low_stock: "Low stock alert",
    payment_failed: "Payment failed",
    new_review: "New customer review",
    refund_requested: "Refund requested",
    daily_summary: "Daily sales summary",
    weekly_summary: "Weekly sales summary",
    new_signup: "New customer signup",
  };

  for (let i = 0; i < 30; i++) {
    const type = types[i % types.length];
    await NotificationLog.create({
      type,
      channel: random(["in_app", "email", "push"]),
      title: titles[type],
      message: `${titles[type]} — sample alert #${i + 1} for admin dashboard testing.`,
      read: i % 3 === 0,
      metadata: { seed: true, index: i + 1 },
      createdAt: daysAgo(randomInt(0, 20)),
    });
  }
  console.log("Seeded notification settings + 30 notification logs");
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check .env.development");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  await clearCollections();
  await seedTeam();
  await settingsService.seedDefaults();

  const products = await seedProducts();
  const customers = await seedCustomers();
  await seedOrders(products, customers);
  await seedInventoryLogs(products);
  await seedCoupons();
  await seedReviews(products, customers);
  await seedNotifications();

  console.log("\n========================================");
  console.log(" Seed complete — frontend-ready data");
  console.log("========================================");
  console.log(" Products:       40");
  console.log(" Customers:      40");
  console.log(" Orders:         60");
  console.log(" Coupons:        8");
  console.log(" Reviews:        50");
  console.log(" Stock logs:     ~25+");
  console.log(" Notifications:  30");
  console.log(" Admins:");
  console.log("   admin@store.com    / Admin@123   (isSuperAdmin: true)");
  console.log("   manager@store.com  / Manager@123 (isAdmin + permissions)");
  console.log("   support@store.com  / Support@123 (isAdmin + limited permissions)");
  console.log(`   Available permissions: ${PERMISSION_LIST.length}`);
  console.log("========================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
