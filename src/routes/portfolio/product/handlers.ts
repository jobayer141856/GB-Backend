import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { product, product_category, product_sale_point, product_sub_category, sales_point } from '../schema';

const created_user = alias(hrSchema.users, 'created_user');

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
    weight: formData.weight,
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

  // get product image name

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
  const { is_published, is_featured, is_popular, is_vatable, is_variable_weight } = c.req.valid('query');

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
    weight: PG_DECIMAL_TO_FLOAT(product.weight),
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

  if (is_published)
    resultPromise.where(eq(product.is_published, is_published));

  if (is_featured)
    resultPromise.where(eq(product.is_featured, is_featured));

  if (is_popular)
    resultPromise.where(eq(product.is_popular, is_popular));

  if (is_vatable)
    resultPromise.where(eq(product.is_vatable, is_vatable));

  if (is_variable_weight)
    resultPromise.where(eq(product.is_variable_weight, is_variable_weight));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const resultPromise = db.select({
    id: product.id,
    uuid: product.uuid,
    name: product.name,
    product_category_uuid: product_sub_category.product_category_uuid,
    product_category_name: product_category.name,
    product_sub_category_uuid: product.product_sub_category_uuid,
    product_sub_category_name: product_sub_category.name,
    image: product.image,
    quantity: PG_DECIMAL_TO_FLOAT(product.quantity),
    unit: product.unit,
    price: PG_DECIMAL_TO_FLOAT(product.price),
    weight: PG_DECIMAL_TO_FLOAT(product.weight),
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
    product_sale_point: sql`
    json_agg(json_build_object(
      'uuid', product_sale_point.uuid,
      'sales_point_uuid', product_sale_point.sales_point_uuid,
      'sales_point_name', sales_point.name,
      'created_by', product_sale_point.created_by,
      'created_by_name', created_user.name,
      'created_at', product_sale_point.created_at,
      'updated_at', product_sale_point.updated_at,
      'remarks', product_sale_point.remarks

    ))`,
  })
    .from(product)
    .leftJoin(hrSchema.users, eq(product.created_by, hrSchema.users.uuid))
    .leftJoin(product_sub_category, eq(product.product_sub_category_uuid, product_sub_category.uuid))
    .leftJoin(product_sale_point, eq(product_sale_point.product_uuid, product.uuid))
    .leftJoin(sales_point, eq(product_sale_point.sales_point_uuid, sales_point.uuid))
    .leftJoin(created_user, eq(product_sale_point.created_by, created_user.uuid))
    .leftJoin(product_category, eq(product_sub_category.product_category_uuid, product_category.uuid))
    .where(eq(product.uuid, uuid))
    .groupBy(product.id, product.uuid, hrSchema.users.name, created_user.name, product_sub_category.name, product_sub_category.product_category_uuid, product_category.name);

  const [data] = await resultPromise;

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
