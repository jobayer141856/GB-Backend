import auth from './auth';
import hr from './hr';
import other from './other';
import portfolio from './portfolio';

const routes = [
  ...hr,
  ...portfolio,
  ...other,
  ...auth,
] as const;

export default routes;
