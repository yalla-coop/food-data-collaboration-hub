import { connector } from './index.js';

const groceryStoreBase = connector.PRODUCT_TYPES['LOCAL_GROCERY-STORE'];
const savoryGroceries = groceryStoreBase.SAVORY_GROCERIES;
const flourType = savoryGroceries.FLOUR;
const cannedGoods = groceryStoreBase.CANNED_GOODS;
const driedGoods = groceryStoreBase.DRIED_GOODS;

export const productTypes = {
  [cannedGoods]: 'Cans',
  [driedGoods?.FLAKE]: 'Flakes',
  [flourType]: 'Flour',
  [driedGoods?.SEED]: 'Seeds',
  [driedGoods?.PULSE]: 'Pulses',
  [driedGoods?.GRAIN]: 'Grain',
  [driedGoods?.FERMENT]: 'Ferments',
  [driedGoods?.DRIED_HERB]: 'Herbs',
  [savoryGroceries?.SNACK]: 'Savory Snacks'
};

export const quantityUnits = {
  [connector.MEASURES.UNIT.QUANTITYUNIT.KILOGRAM]: 'kg'
};
