import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema } from './utils';

const tags = ['portfolio.testimonial'];

export const list = createRoute({
  path: '/portfolio/testimonial',
  method: 'get',
  tags,
  // request: {
  //   query: z.object({
  //     category: z.string().optional(),
  //   }),
  // },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of testimonial',
    ),
  },
});

export const create = createRoute({
  path: '/portfolio/testimonial',
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
      'The created testimonial',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const getOne = createRoute({
  path: '/portfolio/testimonial/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested testimonial',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Testimonial not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/portfolio/testimonial/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: {
            content: {
              'multipart/form-data': {
                schema: {
                  ...patchSchema,
                },
              },
            },
    
    },
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated testimonial',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'Testimonial not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/portfolio/testimonial/{uuid}',
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
