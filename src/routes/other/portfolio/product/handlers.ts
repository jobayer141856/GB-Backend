import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { product } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: product.uuid,
    label: product.name,
  })
    .from(product);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
