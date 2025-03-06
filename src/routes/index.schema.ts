import * as hr from './hr/schema';
import * as portfolio from './portfolio/schema';

const schema = {
  ...hr,
  ...portfolio,
};

export type Schema = typeof schema;

export default schema;
