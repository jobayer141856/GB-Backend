import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { auth_user, users } from '@/routes/hr/schema';

import type { UserAccessRoute, ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { type } = c.req.valid('query');

  const resultPromise = db.select({
    value: users.uuid,
    label: users.name,
  })
    .from(users);

  if (type !== null && type !== undefined) {
    resultPromise.where(eq(users.type, type));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};

export const userAccess: AppRouteHandler<UserAccessRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: users.uuid,
    label: users.name,
    can_access: auth_user.can_access,
  })
    .from(users)
    .leftJoin(auth_user, eq(users.uuid, auth_user.user_uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
