import getParamsSchema from 'stoker/openapi/schemas/get-params-schema';
import SlugParamsSchema from 'stoker/openapi/schemas/slug-params';

const uuid = getParamsSchema({
  name: 'uuid',
  validator: 'nanoid',
});
const userUuid = getParamsSchema({
  name: 'user_uuid',
  validator: 'nanoid',
});

const name = SlugParamsSchema;

export { name, userUuid, uuid };
