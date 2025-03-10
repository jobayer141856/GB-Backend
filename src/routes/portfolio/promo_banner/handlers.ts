import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { promo_banner } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');

  const formData = await c.req.parseBody();

  const image = formData.image;

  const imagePath = await insertFile(image, 'public/promo-banner');

  const value = {
    uuid: formData.uuid,
    name: formData.name,
    image: imagePath,
    discount_type: formData.discount_type,
    discount: formData.discount,
    start_datetime: formData.start_datetime,
    end_datetime: formData.end_datetime,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(promo_banner).values(value).returning({
    name: promo_banner.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await c.req.parseBody();

  // updates includes image then do it else exclude it
  if (formData.image) {
    // get promo banner image name
    const promoBanner = await db.query.promo_banner.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (promoBanner && promoBanner.image) {
      const imagePath = await updateFile(formData.image, promoBanner.image, 'public/promo-banner');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/promo-banner');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(promo_banner)
    .set(formData)
    .where(eq(promo_banner.uuid, uuid))
    .returning({
      name: promo_banner.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get promo banner image name

  const promoBanner = await db.query.promo_banner.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (promoBanner && promoBanner.image) {
    deleteFile(promoBanner.image);
  }

  const [data] = await db.delete(promo_banner)
    .where(eq(promo_banner.uuid, uuid))
    .returning({
      name: promo_banner.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: promo_banner.uuid,
    name: promo_banner.name,
    image: promo_banner.image,
    discount_type: promo_banner.discount_type,
    discount: promo_banner.discount,
    start_datetime: promo_banner.start_datetime,
    end_datetime: promo_banner.end_datetime,
    created_at: promo_banner.created_at,
    updated_at: promo_banner.updated_at,
    remarks: promo_banner.remarks,
    created_by: promo_banner.created_by,
    created_by_name: hrSchema.users.name,
  })
    .from(promo_banner)
    .leftJoin(hrSchema.users, eq(promo_banner.created_by, hrSchema.users.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.promo_banner.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
    with: {
      promo_banner_product: true,
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
