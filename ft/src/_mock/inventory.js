import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const inventory = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid().substring(0, 12),
  img: `/assets/images/avatars/avatar_${index + 1}.jpg`,
  name: faker.commerce.productName(),
  status: sample(['Health', 'Low']),
  level: faker.datatype.number(),
  value: faker.datatype.number(),
}));

export default inventory;
