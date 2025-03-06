import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { promo_banner, promo_banner_discount_type } from '../schema';

//* crud
export const selectSchema = createSelectSchema(promo_banner);

export const insertSchema = createInsertSchema(
  promo_banner,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    image: schema => schema.image.min(1),
    discount_type: schema => schema.discount_type.refine(value => promo_banner_discount_type(value), {
      message: 'Invalid discount_type',
    }),
    discount: schema => schema.discount.min(1),
    start_datetime: schema => schema.start_datetime.regex(dateTimePattern, {
      message: 'start_datetime must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    end_datetime: schema => schema.end_datetime.regex(dateTimePattern, {
      message: 'end_datetime must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
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
  name: true,
  image: true,
  discount_type: true,
  discount: true,
  start_datetime: true,
  end_datetime: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
