import * as HSCode from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { notFoundSchema, unauthorizedSchema } from '@/lib/constants';
import * as param from '@/lib/param';
import { createRoute, z } from '@hono/zod-openapi';

import { loginSchema } from '../google/utils';

const tags = ['auth'];
export const googleLogin = createRoute({
  path: '/auth/login/google',
  method: 'get',
  tags,
  responses: {
    [HSCode.OK]: {
      description: 'Redirects to Google OAuth 2.0 login page',
    },
  },
});

// Google Callback Route
export const googleCallback = createRoute({
  path: '/auth/google/callback',
  method: 'get',
  tags,
  request: {
    query: z.object({
      code: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  responses: {
    [HSCode.OK]: jsonContent(
      loginSchema,
      'The logged-in user',
    ),
    [HSCode.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      'Authentication failed',
    ),
    [HSCode.INTERNAL_SERVER_ERROR]: {
      description: 'Internal server error during authentication',
    },
  },
});

// Existing Login Route
// export const login = createRoute({
//   path: '/login',
//   method: 'post',
//   request: {
//     body: jsonContentRequired(
//       loginSchema,
//       'The user login',
//     ),
//   },
//   tags,
//   responses: {
//     [HSCode.OK]: jsonContent(
//       loginSchema,
//       'The logged user',
//     ),
//     [HSCode.NOT_FOUND]: jsonContent(
//       notFoundSchema,
//       'User not found',
//     ),
//     [HSCode.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(loginSchema)
//         .or(createErrorSchema(param.uuid)),
//       'The validation error(s)',
//     ),
//     [HSCode.UNAUTHORIZED]: jsonContent(
//       unauthorizedSchema,
//       'Wrong password',
//     ),
//   },
// });

// export type LoginRoute = typeof login;
export type GoogleLoginRoute = typeof googleLogin;
export type GoogleCallbackRoute = typeof googleCallback;
