import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { order, order_status } from '../schema';

//* crud
export const selectSchema = createSelectSchema(order);

export const insertSchema = createInsertSchema(
  order,
  {
    uuid: schema => schema.uuid.length(21),
    delivery_address: schema => schema.delivery_address.length(255),
    payment_method: schema => schema.payment_method.length(255),
    status: schema => schema.status.refine(value => order_status(value), {
      message: 'Invalid status',
    }),
    user_uuid: schema => schema.user_uuid.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  user_uuid: true,
  delivery_address: true,
  payment_method: true,
  created_by: true,
}).partial({
  status: true,
  is_delivered: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
