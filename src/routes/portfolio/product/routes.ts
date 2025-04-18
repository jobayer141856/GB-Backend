import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.product'];

export const list = createRoute({
  path: '/portfolio/product',
  method: 'get',
  tags,
  request: {
    query: z.object({
      is_featured: z.string().optional(),
      is_popular: z.string().optional(),
      is_published: z.string().optional(),
      is_vatable: z.string().optional(),
      is_variable_weight: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of product',
    ),
  },
});

export const create = createRoute({
  path: '/portfolio/product',
  method: 'post',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            ...insertSchema,
          },
        },
      },
    },
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created product',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/product/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested product',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Product not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/product/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The product updates',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated product',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Product not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/product/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'Testimonial deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Authorities not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
