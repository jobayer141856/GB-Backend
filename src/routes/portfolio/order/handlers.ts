import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { order, order_product, product } from '../schema';

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
    user_phone: hrSchema.users.phone,
    user_email: hrSchema.users.email,
    user_address: hrSchema.users.address,
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

  const resultPromise = db.select({
    id: order.id,
    uuid: order.uuid,
    user_uuid: order.user_uuid,
    user_name: hrSchema.users.name,
    user_phone: hrSchema.users.phone,
    user_email: hrSchema.users.email,
    user_address: hrSchema.users.address,
    delivery_address: order.delivery_address,
    payment_method: order.payment_method,
    status: order.status,
    is_delivered: order.is_delivered,
    created_by: order.created_by,
    created_by_name: created_user.name,
    created_at: order.created_at,
    updated_at: order.updated_at,
    remarks: order.remarks,
    order_product: sql`
    json_agg(json_build_object(
      'uuid', order_product.uuid,
      'product_uuid', order_product.product_uuid,
      'product_name', product.name,
      'quantity', order_product.quantity,
      'price', order_product.price,
      'is_vatable', order_product.is_vatable,
      'created_at', order_product.created_at,
      'updated_at', order_product.updated_at
    ))`,
  })
    .from(order)
    .leftJoin(hrSchema.users, eq(order.user_uuid, hrSchema.users.uuid))
    .leftJoin(created_user, eq(created_user.uuid, order.created_by))
    .leftJoin(order_product, eq(order_product.order_uuid, order.uuid))
    .leftJoin(product, eq(order_product.product_uuid, product.uuid))
    .where(eq(order.uuid, uuid))
    .groupBy(order.id, order.uuid, hrSchema.users.name, created_user.name);

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
