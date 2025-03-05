import { relations, sql } from 'drizzle-orm';
import { boolean, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

const hr = pgSchema('hr');

//* Users
export const users = hr.table('users', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').default(sql`null`),
  office: text('office').notNull(),
  image: text('image'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Auth User

export const auth_user = hr.table('auth_user', {
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  pass: text('pass').notNull(),
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
