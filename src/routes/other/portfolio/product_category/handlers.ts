import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { product_category } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: product_category.uuid,
    label: product_category.name,
  })
    .from(product_category);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
