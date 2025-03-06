import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { recipe } from '../schema';

//* crud
export const selectSchema = createSelectSchema(recipe);

export const insertSchema = createInsertSchema(
  recipe,
  {
    uuid: schema => schema.uuid.length(21),
    product_sub_category_uuid: schema => schema.product_sub_category_uuid.length(21),
    title: schema => schema.title.min(1),
    youtube_url: schema => schema.youtube_url.min(1),
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
  title: true,
  youtube_url: true,
  created_by: true,
  created_at: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
