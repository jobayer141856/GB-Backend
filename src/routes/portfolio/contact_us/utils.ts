import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { contact_us } from '../schema';

//* crud
export const selectSchema = createSelectSchema(contact_us);

export const insertSchema = createInsertSchema(
  contact_us,
  {
    id: schema => schema.id,
    name: schema => schema.name.length(255),
    email: schema => schema.email.length(255),
    phone: schema => schema.phone.length(255),
    message: schema => schema.message.length(255),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  name: true,
  email: true,
  phone: true,
  message: true,
  created_at: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
