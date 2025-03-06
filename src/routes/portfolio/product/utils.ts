import { desc } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { product } from '../schema';

//* crud
export const selectSchema = createSelectSchema(product);

export const insertSchema = createInsertSchema(
  product,
  {
    uuid: schema => schema.uuid.length(21),
    product_sub_category_uuid: schema => schema.product_sub_category_uuid.length(21),
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
  product_sub_category_uuid: true,
  name: true,
  image: true,
  quantity: true,
  unit: true,
  price: true,
  description: true,
  nutrition: true,
  created_at: true,
  created_by: true,
}).partial({
  is_published: true,
  is_vatable: true,
  is_featured: true,
  is_popular: true,
  is_variable_weight: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
