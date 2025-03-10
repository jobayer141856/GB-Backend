import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product_category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const image = formData.image;

  const imagePath = await insertFile(image, 'public/product-category');

  const value = {
    id: formData.id,
    uuid: formData.uuid,
    name: formData.name,
    image: imagePath,
    status: formData.status,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(product_category).values(value).returning({
    name: product_category.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.image) {
    // get product category image name
    const productCategoryData = await db.query.product_category.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (productCategoryData && productCategoryData.image) {
      const imagePath = await updateFile(formData.image, productCategoryData.image, 'public/product-category');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/product-category');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(product_category)
    .set(formData)
    .where(eq(product_category.uuid, uuid))
    .returning({
      name: product_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get info image name

  const productCategoryData = await db.query.product_category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (productCategoryData && productCategoryData.image) {
    deleteFile(productCategoryData.image);
  }

  const [data] = await db.delete(product_category)
    .where(eq(product_category.uuid, uuid))
    .returning({
      name: product_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: product_category.id,
    uuid: product_category.uuid,
    name: product_category.name,
    image: product_category.image,
    status: product_category.status,
    created_at: product_category.created_at,
    updated_at: product_category.updated_at,
    remarks: product_category.remarks,
    created_by: product_category.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(product_category)
    .leftJoin(hrSchema.users, eq(product_category.created_by, hrSchema.users.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.product_category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
