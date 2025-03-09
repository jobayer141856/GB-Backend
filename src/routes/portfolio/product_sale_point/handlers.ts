import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product, product_sale_point, sales_point } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(product_sale_point).values(value).returning({
    name: product_sale_point.uuid,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(product_sale_point)
    .set(values)
    .where(eq(product_sale_point.uuid, uuid))
    .returning({
      name: product_sale_point.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(product_sale_point)
    .where(eq(product_sale_point.uuid, uuid))
    .returning({
      name: product_sale_point.uuid,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: product_sale_point.uuid,
    product_uuid: product.uuid,
    product_name: product.name,
    sales_point_uuid: sales_point.uuid,
    sales_point_name: sales_point.name,
    created_by: product_sale_point.created_by,
    created_by_name: created_user.name,
    created_at: product_sale_point.created_at,
    updated_at: product_sale_point.updated_at,
    remarks: product_sale_point.remarks,
  })
    .from(product_sale_point)
    .leftJoin(product, eq(product.uuid, product_sale_point.product_uuid))
    .leftJoin(sales_point, eq(sales_point.uuid, product_sale_point.sales_point_uuid))
    .leftJoin(created_user, eq(created_user.uuid, product_sale_point.created_by));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.product_sale_point.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
