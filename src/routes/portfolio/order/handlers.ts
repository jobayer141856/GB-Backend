import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { order } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(order).values(value).returning({
    name: order.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(order)
    .set(values)
    .where(eq(order.uuid, uuid))
    .returning({
      name: order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(order)
    .where(eq(order.uuid, uuid))
    .returning({
      name: order.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: order.id,
    uuid: order.uuid,
    user_uuid: order.user_uuid,
    user_name: hrSchema.users.name,
    delivery_address: order.delivery_address,
    payment_method: order.payment_method,
    status: order.status,
    is_delivered: order.is_delivered,
    created_by: order.created_by,
    created_by_name: created_user.name,
    created_at: order.created_at,
    updated_at: order.updated_at,
    remarks: order.remarks,
  })
    .from(order)
    .leftJoin(hrSchema.users, eq(order.user_uuid, hrSchema.users.uuid))
    .leftJoin(created_user, eq(created_user.uuid, order.created_by));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.order.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
    with: {
      order_product: true,
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
