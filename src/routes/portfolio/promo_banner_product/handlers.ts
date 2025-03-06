import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product, promo_banner, promo_banner_product } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(promo_banner_product).values(value).returning({
    name: promo_banner_product.uuid,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(promo_banner_product)
    .set(values)
    .where(eq(promo_banner_product.uuid, uuid))
    .returning({
      name: promo_banner_product.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(promo_banner_product)
    .where(eq(promo_banner_product.uuid, uuid))
    .returning({
      name: promo_banner_product.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: promo_banner_product.uuid,
    promo_banner_uuid: promo_banner_product.promo_banner_uuid,
    promo_banner_name: promo_banner.name,
    product_uuid: promo_banner_product.product_uuid,
    product_name: product.name,
    created_by: promo_banner_product.created_by,
    created_by_name: hrSchema.users.name,
    created_at: promo_banner_product.created_at,
    updated_at: promo_banner_product.updated_at,
    remarks: promo_banner_product.remarks,
  })
    .from(promo_banner_product)
    .leftJoin(promo_banner, eq(promo_banner.uuid, promo_banner_product.promo_banner_uuid))
    .leftJoin(product, eq(product.uuid, promo_banner_product.product_uuid))
    .leftJoin(hrSchema.users, eq(hrSchema.users.uuid, promo_banner_product.created_by));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: promo_banner_product.uuid,
    promo_banner_uuid: promo_banner_product.promo_banner_uuid,
    promo_banner_name: promo_banner.name,
    product_uuid: promo_banner_product.product_uuid,
    product_name: product.name,
    created_by: promo_banner_product.created_by,
    created_by_name: hrSchema.users.name,
    created_at: promo_banner_product.created_at,
    updated_at: promo_banner_product.updated_at,
    remarks: promo_banner_product.remarks,
  })
    .from(promo_banner_product)
    .leftJoin(promo_banner, eq(promo_banner.uuid, promo_banner_product.promo_banner_uuid))
    .leftJoin(product, eq(product.uuid, promo_banner_product.product_uuid))
    .leftJoin(hrSchema.users, eq(hrSchema.users.uuid, promo_banner_product.created_by))
    .where(eq(promo_banner_product.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
