import type { AppRouteHandler } from '@/lib/types';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { ComparePass, CreateToken, HashPass } from '@/middlewares/auth';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchChangePasswordRoute,
  PatchRoute,
  PatchUserStatusRoute,
  RemoveRoute,
  SigninRoute,
} from './routes';

import { auth_user, users } from '../schema';

export const userSignin: AppRouteHandler<SigninRoute> = async (c: any) => {
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const { email, pass } = await c.req.json();
  const resultPromise = db.select({
    email: users.email,
    pass: users.pass,
    status: users.status,
    uuid: users.uuid,
    name: users.name,
  })
    .from(users)
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

  const match = ComparePass(pass, data.pass);
  if (!match) {
    return c.json({ message: 'Email/Password does not match' }, HSCode.UNAUTHORIZED);
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    uuid: data.uuid,
    username: data.name,
    email: data.email,
    exp: now + 60 * 60 * 24,
  };

  const token = await CreateToken(payload);

  const user = {
    uuid: data.uuid,
    name: data.name,
    email: data.email,
    pass: data.pass,
    status: data.status,
  };

  return c.json({ payload, token, user }, HSCode.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const { pass } = await c.req.json();

  value.pass = await HashPass(pass);

  // const formData = await c.req.parseBody();

  // formData.pass = await HashPass(formData.pass);

  // const value = {
  //   uuid: formData.uuid,
  //   name: formData.name,
  //   office: formData.office,
  //   phone: formData.phone,
  //   email: formData.email,
  //   pass: formData.pass,
  //   created_at: formData.created_at,
  //   updated_at: formData.updated_at,
  //   status: formData.status,
  //   remarks: formData.remarks,
  // };

  // value.pass = await HashPass(value.pass);

  const [data] = await db.insert(users).values(value).returning({
    name: users.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(users)
    .set(updates)
    .where(eq(users.uuid, uuid))
    .returning({
      name: users.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(users)
    .where(eq(users.uuid, uuid))
    .returning({
      name: users.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: users.id,
    uuid: users.uuid,
    name: users.name,
    email: users.email,
    phone: users.phone,
    address: users.address,
    gender: users.gender,
    type: users.type,
    created_at: users.created_at,
    updated_at: users.updated_at,
    status: users.status,
    can_access: auth_user.can_access,
    remarks: users.remarks,
  })
    .from(users)
    .leftJoin(auth_user, eq(users.uuid, auth_user.user_uuid));

  const data = await resultPromise;

  return c.json(data || {}, HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: users.id,
    uuid: users.uuid,
    name: users.name,
    email: users.email,
    phone: users.phone,
    address: users.address,
    gender: users.gender,
    type: users.type,
    created_at: users.created_at,
    updated_at: users.updated_at,
    status: users.status,
    can_access: auth_user.can_access,
    remarks: users.remarks,
  })
    .from(users)
    .leftJoin(auth_user, eq(users.uuid, auth_user.user_uuid))
    .where(eq(users.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || null, HSCode.OK);
};

export const patchChangePassword: AppRouteHandler<PatchChangePasswordRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const { pass, updated_at } = await c.req.json();

  // if (Object.keys(updates).length === 0)
  //   return ObjectNotFound(c);

  const pass2 = await HashPass(pass);

  const [data] = await db.update(users)
    .set({
      pass: pass2,
      updated_at,
    })
    .where(eq(users.uuid, uuid))
    .returning({
      name: users.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

// export const getCanAccess: AppRouteHandler<GetCanAccessRoute> = async (c: any) => {
//   const { uuid } = c.req.valid('param');

//   const resultPromise = db.select({
//     can_access: users.can_access,
//   })
//     .from(users)
//     .where(eq(users.uuid, uuid));

//   const [data] = await resultPromise;

//   if (!data)
//     return DataNotFound(c);

//   return c.json(data || null, HSCode.OK);
// };

// export const patchCanAccess: AppRouteHandler<PatchCanAccessRoute> = async (c: any) => {
//   const { uuid } = c.req.valid('param');
//   const { can_access } = await c.req.json();

//   const [data] = await db.update(users)
//     .set({ can_access })
//     .where(eq(users.uuid, uuid))
//     .returning({
//       name: users.name,
//     });

//   if (!data)
//     return DataNotFound(c);

//   return c.json(createToast('update', data.name), HSCode.OK);
// };

export const patchUserStatus: AppRouteHandler<PatchUserStatusRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const { status } = await c.req.json();

  const [data] = await db.update(users)
    .set({ status })
    .where(eq(users.uuid, uuid))
    .returning({
      name: users.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};
