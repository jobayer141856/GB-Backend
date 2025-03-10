import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { product_category, product_sub_category } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: product_sub_category.uuid,
    label: sql`${product_sub_category.name} || '-' || ${product_category.name}`,
  })
    .from(product_sub_category)
    .leftJoin(product_category, eq(product_category.uuid, product_sub_category.product_category_uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
