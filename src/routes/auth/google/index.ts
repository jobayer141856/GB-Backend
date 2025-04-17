import { createRouter } from '@/lib/create_app';

import * as handlers from './handlers';
import * as routes from './routes';

const router = createRouter()
//   .openapi(routes.login, handlers.login)
  .openapi(routes.googleLogin, handlers.googleLogin)
  .openapi(routes.googleCallback, handlers.googleCallback);

// .openapi(routes.patchChangePassword, handlers.patchChangePassword);

export default router;
