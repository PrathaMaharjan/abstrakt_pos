import { pgTable, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";
export const tenantStatusEnum = pgEnum("tenant_status", [
  "ACTIVE",
  "SUSPENDED",
  "DELETED",
]);

export const platformRoleEnum = pgEnum("platform_role", [
  "support",
  "admin",
  "billing",
]);

export const tenant = pgTable("tenant", {
  id: text("id").primaryKey(),
  name: text("text").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  status: tenantStatusEnum("status").notNull().default("ACTIVE"),
  stripeCustomerId: text("stripe_customer_id"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const loaction = pgTable("location", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updateAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tenantUser = pgTable("tenant_user", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenant.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const platfrom_User = pgTable("platfrom_user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: platformRoleEnum("role").notNull().default("support"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tenantRelations = relations(tenant, ({ many }) => ({
  loactions: many(loaction),
  tenantUser: many(tenantUser),
}));

export const locationRelations = relations(loaction, ({ one }) => ({
  tenant: one(tenant, { fields: [loaction.tenantId], references: [tenant.id] }),
}));

export const tenantUserRelations = relations(tenantUser, ({ one }) => ({
  tenant: one(tenant, {
    fields: [tenantUser.tenantId],
    references: [tenant.id],
  }),
}));

export type Tenant = typeof tenant.$inferInsert;
export type NewTenant = typeof tenant.$inferInsert;
export type Location = typeof location.$inferSelect;
export type NewLocation = typeof location.$inferInsert;
export type TenantUser = typeof tenantUser.$inferSelect;
export type NewTenantUser = typeof tenantUser.$inferInsert;
export type PlatformUser = typeof platformUser.$inferSelect;
