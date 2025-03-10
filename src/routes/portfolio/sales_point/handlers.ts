import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { sales_point, shop } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(sales_point).values(value).returning({
    name: sales_point.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(sales_point)
    .set(values)
    .where(eq(sales_point.uuid, uuid))
    .returning({
      name: sales_point.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(sales_point)
    .where(eq(sales_point.uuid, uuid))
    .returning({
      name: sales_point.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: sales_point.id,
    uuid: sales_point.uuid,
    shop_uuid: sales_point.shop_uuid,
    shop_name: shop.name,
    shop_image: shop.image,
    name: sales_point.name,
    phone: sales_point.phone,
    details: sales_point.details,
    latitude: sales_point.latitude,
    longitude: sales_point.longitude,
    address: sales_point.address,
    created_by: sales_point.created_by,
    created_by_name: created_user.name,
    created_at: sales_point.created_at,
    updated_at: sales_point.updated_at,
    remarks: sales_point.remarks,
  })
    .from(sales_point)
    .leftJoin(shop, eq(shop.uuid, sales_point.shop_uuid))
    .leftJoin(created_user, eq(created_user.uuid, sales_point.created_by));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: sales_point.id,
    uuid: sales_point.uuid,
    shop_uuid: sales_point.shop_uuid,
    shop_name: shop.name,
    shop_image: shop.image,
    name: sales_point.name,
    phone: sales_point.phone,
    details: sales_point.details,
    latitude: sales_point.latitude,
    longitude: sales_point.longitude,
    address: sales_point.address,
    created_by: sales_point.created_by,
    created_by_name: created_user.name,
    created_at: sales_point.created_at,
    updated_at: sales_point.updated_at,
    remarks: sales_point.remarks,
  })
    .from(sales_point)
    .leftJoin(shop, eq(shop.uuid, sales_point.shop_uuid))
    .leftJoin(created_user, eq(created_user.uuid, sales_point.created_by))
    .where(eq(sales_point.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
