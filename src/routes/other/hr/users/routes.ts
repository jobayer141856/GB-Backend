import * as HSCode from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

import { createRoute, z } from '@hono/zod-openapi';

const tags = ['other'];

export const valueLabelRoute = createRoute({
  path: '/other/hr/users/value/label',
  method: 'get',
  tags,
  requests: {
    query: z.object({
      type: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
      'The valueLabel of users',
    ),
  },
});

export const userAccess = createRoute({
  path: '/other/hr/users-can-access/value/label',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.object({
        value: z.string(),
        label: z.string(),
        can_access: z.string(),
      }),
      'The valueLabel can_access of user',
    ),
  },
});

export type ValueLabelRoute = typeof valueLabelRoute;
export type UserAccessRoute = typeof userAccess;
