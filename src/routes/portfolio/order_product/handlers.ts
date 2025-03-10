import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { order_product } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(order_product).values(value).returning({
    name: order_product.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(order_product)
    .set(values)
    .where(eq(order_product.uuid, uuid))
    .returning({
      name: order_product.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(order_product)
    .where(eq(order_product.uuid, uuid))
    .returning({
      name: order_product.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: order_product.uuid,
    order_uuid: order_product.order_uuid,
    product_uuid: order_product.product_uuid,
    quantity: order_product.quantity,
    price: PG_DECIMAL_TO_FLOAT(order_product.price),
    is_vatable: order_product.is_vatable,
    created_at: order_product.created_at,
    updated_at: order_product.updated_at,
    remarks: order_product.remarks,
  })
    .from(order_product);

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: order_product.uuid,
    order_uuid: order_product.order_uuid,
    product_uuid: order_product.product_uuid,
    quantity: order_product.quantity,
    price: PG_DECIMAL_TO_FLOAT(order_product.price),
    is_vatable: order_product.is_vatable,
    created_at: order_product.created_at,
    updated_at: order_product.updated_at,
    remarks: order_product.remarks,
  })
    .from(order_product)
    .where(eq(order_product.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
