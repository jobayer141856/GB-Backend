
import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
// import { alias } from 'drizzle-orm/pg-core';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import * as hrSchema from '@/routes/hr/schema';
import { createToast, DataNotFound, ObjectNotFound } from '@/utils/return';
import { deleteFile, insertFile, updateFile } from '@/utils/upload_file';

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from './routes';

import { testimonial } from '../schema';

// const created_user = alias(hrSchema.users, 'created_user');

export const create: AppRouteHandler<CreateRoute> = async (c: any) => {
  // const value = c.req.valid('json');
  const formData = await c.req.parseBody();

  const image = formData.image;

  const imagePath = await insertFile(image, 'public/testimonial');

  const value = {
    uuid: formData.uuid,
    name: formData.name,
    description: formData.description,
    image: imagePath,
    created_by: formData.created_by,
    created_at: formData.created_at,
    updated_at: formData.updated_at,
    remarks: formData.remarks,
  };

  const [data] = await db.insert(testimonial).values(value).returning({
    name: testimonial.name,
  });

  return c.json(createToast('create', data.name), HSCode.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const formData = await c.req.parseBody();

  // updates includes file then do it else exclude it
  if (formData.image) {
    // get info file name
    const testimonialData = await db.query.testimonial.findFirst({
      where(fields, operators) {
        return operators.eq(fields.uuid, uuid);
      },
    });

    if (testimonialData && testimonialData.image) {
      const imagePath = await updateFile(formData.file, testimonialData.image, 'public/testimonial');
      formData.image = imagePath;
    }
    else {
      const imagePath = await insertFile(formData.image, 'public/testimonial');
      formData.image = imagePath;
    }
  }

  if (Object.keys(formData).length === 0)
    return ObjectNotFound(c);

  const [data] = await db.update(testimonial)
    .set(formData)
    .where(eq(testimonial.uuid, uuid))
    .returning({
      name: testimonial.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('update', data.name), HSCode.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  // get info image name

  const testimonialData = await db.query.testimonial.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (testimonialData && testimonialData.image) {
    deleteFile(testimonialData.image);
  }

  const [data] = await db.delete(testimonial)
    .where(eq(testimonial.uuid, uuid))
    .returning({
      name: testimonial.name,
    });

  if (!data)
    return DataNotFound(c);

  return c.json(createToast('delete', data.name), HSCode.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c: any) => {
  const resultPromise = db.select({
    uuid: testimonial.uuid,
    name: testimonial.name,
    description: testimonial.description,
    image: testimonial.image,
    created_at: testimonial.created_at,
    updated_at: testimonial.updated_at,
    remarks: testimonial.remarks,
    created_by: testimonial.created_by,
    created_by_name: hrSchema.users.name,

  })
    .from(testimonial)
    .leftJoin(hrSchema.users, eq(testimonial.created_by, hrSchema.users.uuid));

  const data: any[] = await resultPromise;

  return c.json(data || [], HSCode.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c: any) => {
  const { uuid } = c.req.valid('param');

  const data = await db.query.testimonial.findFirst({
    where(fields, operators) {
      return operators.eq(fields.uuid, uuid);
    },
  });

  if (!data)
    return DataNotFound(c);

  return c.json(data || {}, HSCode.OK);
};
