import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { shop } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: shop.uuid,
    label: shop.name,
  })
    .from(shop);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
