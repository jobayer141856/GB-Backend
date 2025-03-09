import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { product_sale_point } from '../schema';

//* crud
export const selectSchema = createSelectSchema(product_sale_point);

export const insertSchema = createInsertSchema(
  product_sale_point,
  {
    uuid: schema => schema.uuid.length(21),
    product_uuid: schema => schema.product_uuid.length(21),
    sales_point_uuid: schema => schema.sales_point_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  product_uuid: true,
  sales_point_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
