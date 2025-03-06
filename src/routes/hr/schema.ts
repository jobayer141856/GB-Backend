import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

const hr = pgSchema('hr');

export const users_id = hr.sequence('users_id', DEFAULT_SEQUENCE);

export const users_type = hr.enum('users_type', ['client', 'partner', 'admin']);

//* Users
export const users = hr.table('users', {
  id: integer('id').default(sql`nextval('hr.users_id')`),
  uuid: uuid_primary,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  pass: text('pass').notNull(),
  phone: text('phone').default(sql`null`),
  address: text('address').default(sql`null`),
  gender: text('gender').default(sql`null`),
  type: users_type('type').default('client'),
  status: boolean('status').default(false),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Auth User

export const auth_user = hr.table('auth_user', {
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  can_access: text('can_access'),
  status: boolean('status').default(false),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Relations
export const hr_user_rel = relations(users, ({ one }) => ({
  user: one(auth_user, {
    fields: [users.uuid],
    references: [auth_user.user_uuid],
  }),
}));

export default hr;
