import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { product_sub_category } from '../schema';

//* crud
export const selectSchema = createSelectSchema(product_sub_category);

export const insertSchema = createInsertSchema(
  product_sub_category,
  {
    uuid: schema => schema.uuid.length(21),
    product_category_uuid: schema => schema.product_category_uuid.length(21),
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
  product_category_uuid: true,
  name: true,
  image: true,
  created_at: true,
  created_by: true,
}).partial({
  status: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
