import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product_category, product_sub_category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const image = formData.image;

  let imagePath = null;

  if (image != null) {
    imagePath = await insertFile(image, 'public/product-sub-category');
  }
  else {
    imagePath = null;
  }

  const value = {
    id: formData.id,
    uuid: formData.uuid,
    product_category_uuid: formData.product_category_uuid,
    name: formData.name,
    image: imagePath,
    status: formData.status,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(product_sub_category).values(value).returning({
    name: product_sub_category.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.image) {
    // get product sub category image name
    const productSubCategoryData = await db.query.product_sub_category.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (productSubCategoryData && productSubCategoryData.image) {
      const imagePath = await updateFile(formData.image, productSubCategoryData.image, 'public/product-sub-category');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/product-sub-category');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(product_sub_category)
    .set(formData)
    .where(eq(product_sub_category.uuid, uuid))
    .returning({
      name: product_sub_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get product sub category image name

  const productSubCategoryData = await db.query.product_sub_category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (productSubCategoryData && productSubCategoryData.image) {
    deleteFile(productSubCategoryData.image);
  }

  const [data] = await db.delete(product_sub_category)
    .where(eq(product_sub_category.uuid, uuid))
    .returning({
      name: product_sub_category.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: product_sub_category.id,
    uuid: product_sub_category.uuid,
    name: product_sub_category.name,
    product_category_uuid: product_sub_category.product_category_uuid,
    product_category_name: product_category.name,
    image: product_sub_category.image,
    status: product_sub_category.status,
    created_at: product_sub_category.created_at,
    updated_at: product_sub_category.updated_at,
    remarks: product_sub_category.remarks,
    created_by: product_sub_category.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(product_sub_category)
    .leftJoin(hrSchema.users, eq(product_sub_category.created_by, hrSchema.users.uuid))
    .leftJoin(product_category, eq(product_sub_category.product_category_uuid, product_category.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.product_sub_category.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
