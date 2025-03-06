import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product_sub_category, recipe } from '../schema';

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  const value = c.req.valid('json');

  const [data] = await db.insert(recipe).values(value).returning({
    name: recipe.title,
  });

  return c.json(createToast('create', data.name ?? ''), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const values = c.req.valid('json');

  if (Object.keys(values).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(recipe)
    .set(values)
    .where(eq(recipe.uuid, uuid))
    .returning({
      name: recipe.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name ?? ''), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const [data] = await db.delete(recipe)
    .where(eq(recipe.uuid, uuid))
    .returning({
      name: recipe.title,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name ?? ''), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: recipe.uuid,
    product_sub_category_uuid: recipe.product_sub_category_uuid,
    product_sub_category_name: product_sub_category.name,
    title: recipe.title,
    youtube_url: recipe.youtube_url,
    created_by: recipe.created_by,
    created_by_name: hrSchema.users.name,
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
    remarks: recipe.remarks,
  })
    .from(recipe)
    .leftJoin(hrSchema.users, eq(recipe.created_by, hrSchema.users.uuid))
    .leftJoin(product_sub_category, eq(recipe.product_sub_category_uuid, product_sub_category.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    uuid: recipe.uuid,
    product_sub_category_uuid: recipe.product_sub_category_uuid,
    product_sub_category_name: product_sub_category.name,
    title: recipe.title,
    youtube_url: recipe.youtube_url,
    created_by: recipe.created_by,
    created_by_name: hrSchema.users.name,
    created_at: recipe.created_at,
    updated_at: recipe.updated_at,
    remarks: recipe.remarks,
  })
    .from(recipe)
    .leftJoin(hrSchema.users, eq(recipe.created_by, hrSchema.users.uuid))
    .leftJoin(product_sub_category, eq(recipe.product_sub_category_uuid, product_sub_category.uuid))
    .where(eq(recipe.uuid, uuid));

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
