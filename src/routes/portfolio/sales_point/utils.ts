import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { sales_point } from '../schema';

//* crud
export const selectSchema = createSelectSchema(sales_point);

export const insertSchema = createInsertSchema(
  sales_point,
  {
    uuid: schema => schema.uuid.length(21),
    shop_uuid: schema => schema.shop_uuid.length(21),
    name: schema => schema.name.min(1),
    phone: schema => schema.phone.min(1),
    details: schema => schema.details.min(1),
    latitude: schema => schema.latitude.min(1),
    longitude: schema => schema.longitude.min(1),
    address: schema => schema.address.min(1),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  shop_uuid: true,
  name: true,
  phone: true,
  details: true,
  latitude: true,
  longitude: true,
  address: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
