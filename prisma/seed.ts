import { PrismaClient, ServiceCategory, SubscriptionStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create org
  const org = await prisma.organization.upsert({
    where: { slug: "my-resell-biz" },
    update: {},
    create: {
      name: "My Resell Business",
      slug: "my-resell-biz",
      plan: "PRO",
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      hashedPassword,
      role: "ADMIN",
      orgId: org.id,
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "svc_chatgpt" },
      update: {},
      create: {
        id: "svc_chatgpt",
        orgId: org.id,
        name: "ChatGPT Plus",
        category: ServiceCategory.AI,
        description: "OpenAI ChatGPT Plus subscription",
        costPrice: 20,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_claude" },
      update: {},
      create: {
        id: "svc_claude",
        orgId: org.id,
        name: "Claude Pro",
        category: ServiceCategory.AI,
        description: "Anthropic Claude Pro subscription",
        costPrice: 20,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_netflix" },
      update: {},
      create: {
        id: "svc_netflix",
        orgId: org.id,
        name: "Netflix Premium",
        category: ServiceCategory.STREAMING,
        description: "Netflix 4K Premium plan",
        costPrice: 15,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_adobe" },
      update: {},
      create: {
        id: "svc_adobe",
        orgId: org.id,
        name: "Adobe Creative Cloud",
        category: ServiceCategory.EDITING,
        description: "Full Adobe CC suite",
        costPrice: 55,
      },
    }),
    prisma.service.upsert({
      where: { id: "svc_capcut" },
      update: {},
      create: {
        id: "svc_capcut",
        orgId: org.id,
        name: "CapCut Pro",
        category: ServiceCategory.EDITING,
        description: "CapCut Pro video editing",
        costPrice: 8,
      },
    }),
  ]);

  // Create clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "client_1" },
      update: {},
      create: {
        id: "client_1",
        orgId: org.id,
        name: "Rahim Khan",
        email: "rahim@example.com",
        phone: "01711-000001",
      },
    }),
    prisma.client.upsert({
      where: { id: "client_2" },
      update: {},
      create: {
        id: "client_2",
        orgId: org.id,
        name: "Fatima Islam",
        email: "fatima@example.com",
        phone: "01811-000002",
      },
    }),
    prisma.client.upsert({
      where: { id: "client_3" },
      update: {},
      create: {
        id: "client_3",
        orgId: org.id,
        name: "Karim Ahmed",
        email: "karim@example.com",
        phone: "01911-000003",
      },
    }),
  ]);

  // Create subscriptions
  const now = new Date();
  const subs = await Promise.all([
    // Active, expires in 20 days
    prisma.subscription.upsert({
      where: { id: "sub_1" },
      update: {},
      create: {
        id: "sub_1",
        orgId: org.id,
        clientId: clients[0].id,
        serviceId: services[0].id,
        status: SubscriptionStatus.ACTIVE,
        purchaseDate: subDays(now, 10),
        durationDays: 30,
        expiryDate: addDays(now, 20),
        salePrice: 30,
      },
    }),
    // Expiring soon - 2 days
    prisma.subscription.upsert({
      where: { id: "sub_2" },
      update: {},
      create: {
        id: "sub_2",
        orgId: org.id,
        clientId: clients[1].id,
        serviceId: services[2].id,
        status: SubscriptionStatus.EXPIRING_SOON,
        purchaseDate: subDays(now, 28),
        durationDays: 30,
        expiryDate: addDays(now, 2),
        salePrice: 25,
      },
    }),
    // Expired
    prisma.subscription.upsert({
      where: { id: "sub_3" },
      update: {},
      create: {
        id: "sub_3",
        orgId: org.id,
        clientId: clients[2].id,
        serviceId: services[3].id,
        status: SubscriptionStatus.EXPIRED,
        purchaseDate: subDays(now, 35),
        durationDays: 30,
        expiryDate: subDays(now, 5),
        salePrice: 80,
      },
    }),
    // Active, expires in 1 day
    prisma.subscription.upsert({
      where: { id: "sub_4" },
      update: {},
      create: {
        id: "sub_4",
        orgId: org.id,
        clientId: clients[0].id,
        serviceId: services[4].id,
        status: SubscriptionStatus.EXPIRING_SOON,
        purchaseDate: subDays(now, 29),
        durationDays: 30,
        expiryDate: addDays(now, 1),
        salePrice: 15,
      },
    }),
  ]);

  // Create payments
  await Promise.all([
    prisma.payment.upsert({
      where: { id: "pay_1" },
      update: {},
      create: {
        id: "pay_1",
        orgId: org.id,
        clientId: clients[0].id,
        subscriptionId: subs[0].id,
        amount: 30,
        status: PaymentStatus.PAID,
        method: PaymentMethod.BKASH,
        paidAt: subDays(now, 10),
      },
    }),
    prisma.payment.upsert({
      where: { id: "pay_2" },
      update: {},
      create: {
        id: "pay_2",
        orgId: org.id,
        clientId: clients[1].id,
        subscriptionId: subs[1].id,
        amount: 25,
        status: PaymentStatus.DUE,
      },
    }),
    prisma.payment.upsert({
      where: { id: "pay_3" },
      update: {},
      create: {
        id: "pay_3",
        orgId: org.id,
        clientId: clients[2].id,
        subscriptionId: subs[2].id,
        amount: 80,
        status: PaymentStatus.PAID,
        method: PaymentMethod.CASH,
        paidAt: subDays(now, 35),
      },
    }),
  ]);

// Create client portal accounts (for /portal/login)
  const clientAccounts = await Promise.all([
    prisma.clientAccount.upsert({
      where: { email: "rahim@example.com" },
      update: {},
      create: {
        orgId: org.id,
        clientId: clients[0].id,
        email: "rahim@example.com",
        name: "Rahim Khan",
        hashedPassword: await bcrypt.hash("password123", 12),
      },
    }),
    prisma.clientAccount.upsert({
      where: { email: "fatima@example.com" },
      update: {},
      create: {
        orgId: org.id,
        clientId: clients[1].id,
        email: "fatima@example.com",
        name: "Fatima Islam",
        hashedPassword: await bcrypt.hash("password123", 12),
      },
    }),
    prisma.clientAccount.upsert({
      where: { email: "karim@example.com" },
      update: {},
      create: {
        orgId: org.id,
        clientId: clients[2].id,
        email: "karim@example.com",
        name: "Karim Ahmed",
        hashedPassword: await bcrypt.hash("password123", 12),
      },
    }),
  ]);

  console.log("✅ Seed complete!");
  console.log(`   Org: ${org.name}`);
  console.log(`   User: admin@example.com / admin123`);
  console.log(`   Services: ${services.length}`);
  console.log(`   Clients: ${clients.length}`);
  console.log(`   Subscriptions: ${subs.length}`);
  console.log(`   Portal Accounts: ${clientAccounts.length} (login with email / password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
