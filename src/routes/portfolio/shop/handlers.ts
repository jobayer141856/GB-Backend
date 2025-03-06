
import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { shop } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  //const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const image = formData.image;

  const imagePath = await insertFile(image, 'public/shop');

  const value = {
    id: formData.id,
    uuid: formData.uuid,
    name: formData.name,
    address: formData.address,
    image: imagePath,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(shop).values(value).returning({
    name: shop.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.image) {
    // get info image name
    const shopData = await db.query.shop.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (shopData && shopData.image) {
      const imagePath = await updateFile(formData.file, shopData.image, 'public/shop');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/shop');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(shop)
    .set(formData)
    .where(eq(shop.uuid, uuid))
    .returning({
      name: shop.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

    // get info image name

    const shopData = await db.query.shop.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });
  
    if (shopData && shopData.image) {
      deleteFile(shopData.image);
    }

  const [data] = await db.delete(shop)
    .where(eq(shop.uuid, uuid))
    .returning({
      name: shop.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: shop.id,
    uuid: shop.uuid,
    name: shop.name,
    image: shop.image,
    address: shop.address,
    created_at: shop.created_at,
    updated_at: shop.updated_at,
    remarks: shop.remarks,
    created_by: shop.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(shop)
    .leftJoin(hrSchema.users, eq(shop.created_by, hrSchema.users.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.shop.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
