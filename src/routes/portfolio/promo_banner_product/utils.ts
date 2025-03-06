import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { promo_banner_product } from '../schema';

//* crud
export const selectSchema = createSelectSchema(promo_banner_product);

export const insertSchema = createInsertSchema(
  promo_banner_product,
  {
    uuid: schema => schema.uuid,
    promo_banner_uuid: schema => schema.promo_banner_uuid.length(21),
    product_uuid: schema => schema.product_uuid.length(21),
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
  promo_banner_uuid: true,
  product_uuid: true,
  created_by: true,
  created_at: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
