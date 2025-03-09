import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

import { users } from '../hr/schema';

const portfolio = pgSchema('portfolio');

export const testimonial = portfolio.table('testimonial', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  description: text('description').notNull(),
  image: text('image').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),

});
export const product_category_id = portfolio.sequence('product_category_id', DEFAULT_SEQUENCE);

export const product_category = portfolio.table('product_category', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('portfolio.product_category_id')`),
  name: text('name').notNull(),
  image: text('image').notNull(),
  status: boolean('status').default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const product_sub_category_id = portfolio.sequence('product_sub_category_id', DEFAULT_SEQUENCE);

export const product_sub_category = portfolio.table('product_sub_category', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('portfolio.product_sub_category_id')`),
  product_category_uuid: defaultUUID('product_category_uuid').references(() => product_category.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  image: text('image').notNull(),
  status: boolean('status').default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const product_id = portfolio.sequence('product_id', DEFAULT_SEQUENCE);

export const product = portfolio.table('product', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('portfolio.product_id')`),
  product_sub_category_uuid: defaultUUID('product_sub_category_uuid').references(() => product_sub_category.uuid, DEFAULT_OPERATION),
  image: text('image').notNull(),
  name: text('name').notNull(),
  quantity: PG_DECIMAL('quantity').notNull(),
  unit: text('unit').notNull(),
  price: PG_DECIMAL('price').notNull(),
  description: text('description').notNull(),
  nutrition: text('nutrition').notNull(),
  is_published: boolean('is_published').default(false),
  is_vatable: boolean('is_vatable').default(false),
  is_featured: boolean('is_featured').default(false),
  is_popular: boolean('is_popular').default(false),
  is_variable_weight: boolean('is_variable_weight').default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const shop_id = portfolio.sequence('shop_id', DEFAULT_SEQUENCE);

export const shop = portfolio.table('shop', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('portfolio.shop_id')`),
  name: text('name').notNull(),
  address: text('address').notNull(),
  image: text('image').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const sales_point_id = portfolio.sequence('sales_point_id', DEFAULT_SEQUENCE);

export const sales_point = portfolio.table('sales_point', {
  uuid: uuid_primary,
  id: integer('id').default(sql`nextval('portfolio.sales_point_id')`),
  shop_uuid: defaultUUID('shop_uuid').references(() => shop.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  details: text('details').notNull(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  address: text('address').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const product_sale_point = portfolio.table('product_sale_point', {
  uuid: uuid_primary,
  product_uuid: defaultUUID('product_uuid').references(() => product.uuid, DEFAULT_OPERATION),
  sales_point_uuid: defaultUUID('sales_point_uuid').references(() => sales_point.uuid, DEFAULT_OPERATION),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const recipe = portfolio.table('recipe', {
  uuid: uuid_primary,
  product_sub_category_uuid: defaultUUID('product_sub_category_uuid').references(() => product_sub_category.uuid, DEFAULT_OPERATION),
  title: text('title').notNull(),
  youtube_url: text('youtube_url').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const promo_banner_discount_type = portfolio.enum('promo_banner_discount_type', [
  'percentage',
  'taka',
]);

export const promo_banner = portfolio.table('promo_banner', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  image: text('image').notNull(),
  discount_type: promo_banner_discount_type('discount_type').notNull(),
  discount: text('discount').notNull(),
  start_datetime: DateTime('start_datetime').notNull(),
  end_datetime: DateTime('end_datetime').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const promo_banner_product = portfolio.table('promo_banner_product', {
  uuid: uuid_primary,
  promo_banner_uuid: defaultUUID('promo_banner_uuid').references(() => promo_banner.uuid, DEFAULT_OPERATION),
  product_uuid: defaultUUID('product_uuid').references(() => product.uuid, DEFAULT_OPERATION),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

// * order

export const order_id = portfolio.sequence('order_id', DEFAULT_SEQUENCE);
export const order_status = portfolio.enum('order_status', [
  'accept',
  'reject',
  'pending',
]);

export const order = portfolio.table('order', {
  id: integer('id').default(sql`nextval('portfolio.order_id')`),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').references(() => users.uuid, DEFAULT_OPERATION),
  delivery_address: text('delivery_address').notNull(),
  payment_method: text('payment_method').notNull(),
  status: order_status('status').default('pending'),
  is_delivered: boolean('is_delivered').default(false),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

// * order product
export const order_product = portfolio.table('order_product', {
  uuid: uuid_primary,
  order_uuid: defaultUUID('order_uuid').references(() => order.uuid, DEFAULT_OPERATION),
  product_uuid: defaultUUID('product_uuid').references(() => product.uuid, DEFAULT_OPERATION),
  quantity: integer('quantity').notNull(),
  is_vatable: boolean('is_vatable').default(false),
  price: PG_DECIMAL('price').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

// * contact us

export const contact_us_id = portfolio.sequence('contact_us_id', DEFAULT_SEQUENCE);

export const contact_us = portfolio.table('contact_us', {
  id: integer('id').default(sql`nextval('portfolio.contact_us_id')`),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* relations *//

export const portfolio_testimonial_rel = relations(testimonial, ({ one }) => ({
  created_by: one(users, {
    fields: [testimonial.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_product_category_rel = relations(product_category, ({ one }) => ({
  created_by: one(users, {
    fields: [product_category.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_product_sub_category_rel = relations(product_sub_category, ({ one }) => ({
  product_category_uuid: one(product_category, {
    fields: [product_sub_category.product_category_uuid],
    references: [product_category.uuid],
  }),

  created_by: one(users, {
    fields: [product_sub_category.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_product_rel = relations(product, ({ one }) => ({
  product_sub_category_uuid: one(product_sub_category, {
    fields: [product.product_sub_category_uuid],
    references: [product_sub_category.uuid],
  }),

  created_by: one(users, {
    fields: [product.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_shop_rel = relations(shop, ({ one }) => ({
  created_by: one(users, {
    fields: [shop.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_sales_point_rel = relations(sales_point, ({ one }) => ({
  shop_uuid: one(shop, {
    fields: [sales_point.shop_uuid],
    references: [shop.uuid],
  }),

  created_by: one(users, {
    fields: [sales_point.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_product_sale_point_rel = relations(product_sale_point, ({ one }) => ({
  product_uuid: one(product, {
    fields: [product_sale_point.product_uuid],
    references: [product.uuid],
  }),

  sales_point_uuid: one(sales_point, {
    fields: [product_sale_point.sales_point_uuid],
    references: [sales_point.uuid],
  }),

  created_by: one(users, {
    fields: [product_sale_point.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_recipe_rel = relations(recipe, ({ one }) => ({
  product_sub_category_uuid: one(product_sub_category, {
    fields: [recipe.product_sub_category_uuid],
    references: [product_sub_category.uuid],
  }),

  created_by: one(users, {
    fields: [recipe.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_promo_banner_rel = relations(promo_banner, ({ one }) => ({
  created_by: one(users, {
    fields: [promo_banner.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_promo_banner_product_rel = relations(promo_banner_product, ({ one }) => ({
  promo_banner_uuid: one(promo_banner, {
    fields: [promo_banner_product.promo_banner_uuid],
    references: [promo_banner.uuid],
  }),

  product_uuid: one(product, {
    fields: [promo_banner_product.product_uuid],
    references: [product.uuid],
  }),

  created_by: one(users, {
    fields: [promo_banner_product.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_order_rel = relations(order, ({ one, many }) => ({
  user_uuid: one(users, {
    fields: [order.user_uuid],
    references: [users.uuid],
  }),
  order_product: many(order_product),
  created_by: one(users, {
    fields: [order.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_order_product_rel = relations(order_product, ({ one }) => ({
  order_uuid: one(order, {
    fields: [order_product.order_uuid],
    references: [order.uuid],
  }),

  product_uuid: one(product, {
    fields: [order_product.product_uuid],
    references: [product.uuid],
  }),
}));

export default portfolio;
