// import type { JWTPayload } from 'hono/utils/jwt/types';

// import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// import { dateTimePattern } from '@/utils';

//* crud
// export const selectSchema = createSelectSchema(users);

export const loginSchema = z.object({
  email: z.string().email(),
  pass: z.string().min(4).max(50),
});

// export const signinOutputSchema = z.object({
//   payload: z.object({
//     uuid: z.string(),
//     username: z.string(),
//     email: z.string(),
//     // can_access: z.string(),
//     exp: z.number(),
//   }) as z.Schema<JWTPayload>,
//   token: z.string(),
// });

// export const insertSchema = createInsertSchema(
//   users,
//   {
//     uuid: schema => schema.uuid.length(21),
//     name: schema => schema.name.min(1).max(255),
//     email: schema => schema.email.min(1),
//     phone: schema => schema.phone.min(1).max(50).optional(),
//     pass: schema => schema.pass.min(4).max(50),
//     created_at: schema => schema.created_at.regex(dateTimePattern, {
//       message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
//     }),
//     updated_at: schema => schema.updated_at.regex(dateTimePattern, {
//       message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
//     }),
//   },
// ).required({
//   uuid: true,
//   name: true,
//   email: true,
//   pass: true,
//   created_at: true,
// }).partial({
//   phone: true,
//   address: true,
//   status: true,
//   // can_access: true,
//   updated_at: true,
//   remarks: true,
// });

// export const patchSchema = insertSchema.partial();
