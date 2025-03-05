import type { AppRouteHandler } from '@/lib/types';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { ComparePass, CreateToken, HashPass } from '@/middlewares/auth';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type {
  CreateRoute,
  GetCanAccessRoute,
  GetOneRoute,
  ListRoute,
  PatchCanAccessRoute,
  PatchChangePasswordRoute,
  PatchRoute,
  PatchStatusRoute,
  RemoveRoute,
  SigninRoute,

} from './routes';

import { auth_user, users } from '../schema';

export const signin: AppRouteHandler<SigninRoute> = async (c: any) => {
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const { email, pass } = await c.req.json();

  const resultPromise = db.select({
    uuid: auth_user.uuid,
    user_uuid: auth_user.user_uuid,
    email: users.email,
    pass: auth_user.pass,
    can_access: auth_user.can_access,
    status: auth_user.status,
    created_at: auth_user.created_at,
    updated_at: auth_user.updated_at,
    remarks: auth_user.remarks,
    name: users.name,
  })
    .from(auth_user)
    .leftJoin(users, eq(auth_user.user_uuid, users.uuid))
    .where(eq(users.email, email));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  if (!data.status) {
    return c.json(
      { message: 'Account is disabled' },
      HSCode.UNAUTHORIZED,
    );
  }

  const match = await ComparePass(pass, data.pass);

  if (!match) {
    return c.json(
      { message: 'Invalid password' },
      HSCode.UNAUTHORIZED,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    uuid: data.uuid,
    username: data.name,
    // can_access: data.can_access,
    exp: now + 60 * 60 * 24,
  };

  const token = await CreateToken(payload);

  const user = {
    user_uuid: data.user_uuid,
    uuid: data.uuid,
    email: data.email,
    name: data.name,
  };

  const can_access = data.can_access;

  return c.json({ payload, token, can_access, user }, HSCode.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const { pass } = await c.req.json();

  value.pass = await HashPass(pass);

  const [data] = await db.insert(auth_user).values(value).returning({
    name: auth_user.user_uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(auth_user)
    .set(updates)
    .where(eq(auth_user.uuid, uuid))
    .returning({
      name: auth_user.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(auth_user)
    .where(eq(auth_user.uuid, uuid))
    .returning({
      name: auth_user.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: auth_user.uuid,
    user_uuid: auth_user.user_uuid,
    pass: auth_user.pass,
    can_access: auth_user.can_access,
    status: auth_user.status,
    created_at: auth_user.created_at,
    updated_at: auth_user.updated_at,
    remarks: auth_user.remarks,
    name: users.name,
    image: users.image,
    email: users.email,
    phone: users.phone,
    office: users.office,
  })
    .from(auth_user)
    .leftJoin(users, eq(auth_user.user_uuid, users.uuid));

  const data = await resultPromise;

  return c.json(data || {}, HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: auth_user.uuid,
    user_uuid: auth_user.user_uuid,
    pass: auth_user.pass,
    can_access: auth_user.can_access,
    status: auth_user.status,
    created_at: auth_user.created_at,
    updated_at: auth_user.updated_at,
    remarks: auth_user.remarks,
    name: users.name,
    image: users.image,
    email: users.email,
    phone: users.phone,
    office: users.office,
  })
    .from(auth_user)
    .leftJoin(users, eq(auth_user.user_uuid, users.uuid))
    .where(eq(auth_user.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || null, HSCode.OK);
};

export const getCanAccess: AppRouteHandler<GetCanAccessRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    can_access: auth_user.can_access,
  })
    .from(auth_user)
    .leftJoin(users, eq(auth_user.user_uuid, users.uuid))
    .where(eq(auth_user.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || null, HSCode.OK);
};

export const patchCanAccess: AppRouteHandler<PatchCanAccessRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const { can_access } = await c.req.json();

  const [data] = await db.update(auth_user)
    .set({ can_access })
    .where(eq(auth_user.uuid, uuid))
    .returning({
      name: auth_user.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const patchStatus: AppRouteHandler<PatchStatusRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const { status } = await c.req.json();

  const [data] = await db.update(auth_user)
    .set({ status })
    .where(eq(auth_user.uuid, uuid))
    .returning({
      name: auth_user.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const patchChangePassword: AppRouteHandler<PatchChangePasswordRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const { pass, updated_at } = await c.req.json();

  // if (Object.keys(updates).length === 0)
  //   return ObjectNotFound(c);

  const pass2 = await HashPass(pass);

  const [data] = await db.update(auth_user)
    .set({
      pass: pass2,
      updated_at,
    })
    .where(eq(auth_user.uuid, uuid))
    .returning({
      name: auth_user.user_uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};
