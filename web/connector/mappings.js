import { loadConnectorWithResources } from './index.js';

export const loadProductTypes = async () => {
  const connector = await loadConnectorWithResources();

  const groceryStoreBase = connector.PRODUCT_TYPES['LOCAL_GROCERY-STORE'];
  const savoryGroceries = groceryStoreBase.SAVORY_GROCERIES;
  const flourType = savoryGroceries.FLOUR;
  const cannedGoods = groceryStoreBase.CANNED_GOODS;
  const driedGoods = groceryStoreBase.DRIED_GOODS;

  return {
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
};

export const loadQuantityUnits = async () => {
  const connector = await loadConnectorWithResources();
  return {
    [connector.MEASURES.UNIT.QUANTITYUNIT.KILOGRAM]: 'kg'
  };
};
