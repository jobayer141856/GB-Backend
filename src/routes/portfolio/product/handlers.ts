import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product, product_sub_category } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const image = formData.image;

  const imagePath = await insertFile(image, 'public/product');

  const value = {
    id: formData.id,
    uuid: formData.uuid,
    product_sub_category_uuid: formData.product_sub_category_uuid,
    name: formData.name,
    image: imagePath,
    quantity: formData.quantity,
    unit: formData.unit,
    price: formData.price,
    description: formData.description,
    nutrition: formData.nutrition,
    is_published: formData.is_published,
    is_vatable: formData.is_vatable,
    is_featured: formData.is_featured,
    is_popular: formData.is_popular,
    is_variable_weight: formData.is_variable_weight,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(product).values(value).returning({
    name: product.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');
  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.image) {
    // get product image name
    const productData = await db.query.product.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (productData && productData.image) {
      const imagePath = await updateFile(formData.image, productData.image, 'public/product');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/product');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(product)
    .set(formData)
    .where(eq(product.uuid, uuid))
    .returning({
      name: product.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get info image name

  const productData = await db.query.product.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (productData && productData.image) {
    deleteFile(productData.image);
  }

  const [data] = await db.delete(product)
    .where(eq(product.uuid, uuid))
    .returning({
      name: product.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    id: product.id,
    uuid: product.uuid,
    name: product.name,
    product_sub_category_uuid: product.product_sub_category_uuid,
    product_sub_category_name: product_sub_category.name,
    image: product.image,
    quantity: PG_DECIMAL_TO_FLOAT(product.quantity),
    unit: product.unit,
    price: PG_DECIMAL_TO_FLOAT(product.price),
    description: product.description,
    nutrition: product.nutrition,
    is_published: product.is_published,
    is_vatable: product.is_vatable,
    is_featured: product.is_featured,
    is_popular: product.is_popular,
    is_variable_weight: product.is_variable_weight,
    created_at: product.created_at,
    updated_at: product.updated_at,
    remarks: product.remarks,
    created_by: product.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(product)
    .leftJoin(hrSchema.users, eq(product.created_by, hrSchema.users.uuid))
    .leftJoin(product_sub_category, eq(product.product_sub_category_uuid, product_sub_category.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.product.findFirst({
    extras: {
      quantity: PG_DECIMAL_TO_FLOAT(product.quantity).as('quantity'),
      price: PG_DECIMAL_TO_FLOAT(product.price).as('price'),
    },
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
