import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { order_product } from '../schema';

//* crud
export const selectSchema = createSelectSchema(order_product);

export const insertSchema = createInsertSchema(
  order_product,
  {
    uuid: schema => schema.uuid.length(21),
    order_uuid: schema => schema.order_uuid.length(21),
    product_uuid: schema => schema.product_uuid.length(21),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  order_uuid: true,
  product_uuid: true,
  quantity: true,
  price: true,
  created_at: true,
}).partial({
  is_vatable: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
