import type { AppRouteHandler } from '@/lib/types';
// import db from '@/db';
// import { auth_user, users } from '@/schema';
// import { eq } from 'drizzle-orm';
// import { CreateToken } from '@/middlewares/auth';
import type { JWTPayload } from 'hono/utils/jwt/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
// import axios from 'axios';
// import { serialize } from 'cookie';
import env from '@/env';
import nanoid from '@/lib/nanoid';
import { CreateToken } from '@/middlewares/auth';
import { createToast } from '@/utils/return';

import type {
  GoogleCallbackRoute,
  GoogleLoginRoute,
  // LoginRoute,
} from './routes';

import { users } from './../../hr/schema';

export const googleLogin: AppRouteHandler<GoogleLoginRoute> = async (c) => {
  const redirectUri = `${env.SERVER_URL}/v1/auth/login/google/callback`;
  const scopes = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  // const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  // url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  // url.searchParams.set('redirect_uri', `${env.SERVER_URL}/v1/auth/google/callback`);
  // url.searchParams.set('response_type', 'code');
  // url.searchParams.set('scope', 'openid email profile');
  // url.searchParams.set('prompt', 'consent');

  // return c.redirect(url.toString());

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'select_account');

  return c.redirect(authUrl.toString());
};

export const googleCallback: AppRouteHandler<GoogleCallbackRoute> = async (c) => {
  // const code = c.req.query('code');
  // if (!code) {
  //   return DataNotFound(c);
  // }

  // const tokenUrl = 'https://oauth2.googleapis.com/token';
  // const tokenParams = new URLSearchParams({
  //   client_id: env.GOOGLE_CLIENT_ID,
  //   client_secret: env.GOOGLE_CLIENT_SECRET,
  //   redirect_uri: `${env.SERVER_URL}/v1/auth/google/callback`,
  //   code: code as string,
  //   grant_type: 'authorization_code',
  // });

  // const tokenResponse = await fetch(tokenUrl, {
  //   method: 'POST',
  //   body: tokenParams,
  // });

  // if (!tokenResponse.ok) {
  //   return DataNotFound(c);
  // }

  // const tokenData = await tokenResponse.json();
  // const accessToken = tokenData.access_token;

  // // Fetch user info from Google
  // const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
  // const userInfoResponse = await fetch(userInfoUrl, {
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // });

  // if (!userInfoResponse.ok) {
  //   return DataNotFound(c);
  // }

  // const userInfo = await userInfoResponse.json();
  // const { email } = userInfo;

  // // Check if the user exists in your database
  // const existingUser = await db.query.users.findFirst({
  //   where: eq(users.email, email),
  // });

  // if (!existingUser) {
  // // Create a new user if not found
  // //   existingUser = await db.insert(users).values({
  // //     email,
  // //     name,
  // //     uuid: crypto.randomUUID(), // Generate a unique identifier for the user
  // //     created_at: new Date(),
  // //   }); // Return the newly created user
  // // }
  //   return DataNotFound(c);
  // }

  // // Create JWT token
  // const payload: JWTPayload = {
  //   uuid: existingUser.uuid,
  //   username: existingUser.name,
  //   email: existingUser.email,
  //   exp: Math.floor(Date.now() / 1000) + (60 * 60), // Token expires in one hour
  // };

  // const token = CreateToken(payload);

  // return c.json({ payload, token });
  const { code, error } = c.req.query();

  if (error) {
    return c.json(
      createToast('error', error),
      HSCode.UNAUTHORIZED,
    );
  }

  if (!code) {
    return c.json(
      createToast('create', 'Missing authorization code'),
      HSCode.BAD_REQUEST,
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.SERVER_URL}/v1/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      return c.json(
        createToast('error', 'Failed to exchange authorization code'),
        HSCode.UNAUTHORIZED,
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return c.json(
        createToast('error', 'Failed to fetch user profile'),
        HSCode.UNAUTHORIZED,
      );
    }

    const profile = await userInfoResponse.json();

    if (!profile.email_verified) {
      return c.json(
        createToast('error', 'Email not verified by Google'),
        HSCode.UNAUTHORIZED,
      );
    }

    // Find or create user
    let user = await db.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    const userData = {
      uuid: nanoid(),
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      pass: 'google',
      provider: 'google',
      created_at: new Date().toISOString(),
    };

    if (!user) {
      [user] = await db.insert(users).values(userData).returning();
    }

    // Generate JWT
    const payload: JWTPayload = {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    const token = CreateToken(payload);

    return c.json({
      token,
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
      },
    });
  }
  catch (error) {
    console.error('Authentication error:', error);
    return c.json(
      createToast('error', 'Internal server error during authentication'),
      HSCode.INTERNAL_SERVER_ERROR,
    );
  }
};

// export const login: AppRouteHandler<LoginRoute> = async (c) => {
//   const { email, pass } = await c.req.json();
//   if (!email || !pass) {
//     return c.json(createToast('Email and password are required'), HSCode.BAD_REQUEST);
//   }

//   const user = await db.query.users.findFirst({
//     where: eq(users.email, email),
//   });

//   if (!user) {
//     return c.json(DataNotFound('User not found'), HSCode.NOT_FOUND);
//   }

//   const isPasswordValid = ComparePass(pass, user.pass);
//   if (!isPasswordValid) {
//     return c.json(createToast('Invalid password'), HSCode.UNAUTHORIZED);
//   }

//   // Create JWT token
//   const payload: JWTPayload = {
//     uuid: user.uuid,
//     username: user.name,
//     email: user.email,
//     exp: Math.floor(Date.now() / 1000) + (60 * 60), // Token expires in one hour
//   };

//   const token = CreateToken(payload);

//   return c.json({ payload, token });
// };
