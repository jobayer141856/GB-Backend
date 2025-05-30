import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { insertSchema, patchSchema, selectSchema, signinOutputSchema, signinSchema } from '../users/utils';

const tags = ['hr.users'];

export const list = createRoute({
  path: '/hr/users',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The list of user',
    ),
  },
});

export const create = createRoute({
  path: '/hr/users',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertSchema,
      'The program to create',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The created user',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertSchema),
      'The validation error(s)',
    ),
  },
});

export const userSignin = createRoute({
  path: '/user-signin',
  method: 'post',
  request: {
    body: jsonContentRequired(
      signinSchema,
      'The user login',
    ),
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      signinOutputSchema,
      'The logged user',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
    [HSCode.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      'Wrong password',
    ),
  },
});

export const getOne = createRoute({
  path: '/hr/users/{uuid}',
  method: 'get',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The requested user',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patch = createRoute({
  path: '/hr/users/{uuid}',
  method: 'patch',
  request: {
    params: param.uuid,
    body: jsonContentRequired(
      patchSchema,
      'The user updates',
    ),

  },
  tags,
  responses: {
    [HSCode.OK]: jsonContent(
      selectSchema,
      'The updated user',
    ),
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchSchema)
        .or(createErrorSchema(param.uuid)),
      'The validation error(s)',
    ),
  },
});

export const remove = createRoute({
  path: '/hr/users/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'User deleted',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

export const patchChangePassword = createRoute({
  path: '/hr/users/password/{uuid}',
  method: 'patch',
  tags,
  request: {
    params: param.uuid,
    query: z.object({
      admin: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The change pass of user',
    ),
  },

});

export const signout = createRoute({
  path: '/signout/{uuid}',
  method: 'delete',
  request: {
    params: param.uuid,
  },
  tags,
  responses: {
    [HSCode.NO_CONTENT]: {
      description: 'User Signout',
    },
    [HSCode.NOT_FOUND]: jsonContent(
      notFoundSchema,
      'User not found',
    ),
    [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(param.uuid),
      'Invalid id error',
    ),
  },
});

// export const getCanAccess = createRoute({
//   path: '/hr/users/can-access/{uuid}',
//   method: 'get',
//   tags,
//   request: {
//     params: param.uuid,
//   },
//   responses: {
//     [HSCode.OK]: jsonContent(
//       z.object({
//         can_access: z.string(),
//       }),
//       'The valueLabel of user',
//     ),
//   },
// });

// export const patchCanAccess = createRoute({
//   path: '/hr/users/can-access/{uuid}',
//   method: 'patch',
//   tags,
//   request: {
//     params: param.uuid,
//   },
//   responses: {
//     [HSCode.OK]: jsonContent(
//       z.array(selectSchema),
//       'The valueLabel of user',
//     ),
//   },
// });

export const patchUserStatus = createRoute({
  path: '/hr/user-status/{uuid}',
  method: 'patch',
  tags,
  request: {
    params: param.uuid,
  },
  responses: {
    [HSCode.OK]: jsonContent(
      z.array(selectSchema),
      'The valueLabel of user',
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type SigninRoute = typeof userSignin;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type PatchChangePasswordRoute = typeof patchChangePassword;
export type SignoutRoute = typeof signout;
// export type GetCanAccessRoute = typeof getCanAccess;
// export type PatchCanAccessRoute = typeof patchCanAccess;
export type PatchUserStatusRoute = typeof patchUserStatus;
