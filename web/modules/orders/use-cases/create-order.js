import {
  Address,
  Connector,
  connector,
  Person,
  OrderLine,
  SaleSession,
  Order
} from '../../../../connector/index.js';

const createOrder = async (shopifyOrderBody) => {

  let { customer, id, line_items, updated_at } = shopifyOrderBody

  console.log('create-order customer is', customer)

  const street = customer.default_address.address2 ? [customer.default_address.address1, customer.default_address.address2].join() : customer.default_address.address1;
  const address = new Address({
    connector: connector,
    semanticId: String(customer.default_address.id),
    street: street,
    city: customer.default_address.city,
    postalCode: customer.default_address.zip,
    country: customer.default_address.country,
    state: customer.default_address.province
  });

  const client = new Person({
    connector: connector,
    semanticId: String(customer.id),
    firstName: customer.first_name,
    lastName: customer.last_name,
    email: customer.email,
    phone: customer.phone,
    localizations: [address]
  });

  const saleSession = new SaleSession({
    connector: connector,
    semanticId: 'saleSessionId'
  });

  const lines = line_items.map((line_item) => {
    const { id, quantity, price, title } = line_item

    return new OrderLine({
      connector: connector,
      semanticId: String(id),
      quantity: quantity,
      // TODO including price gives "TypeError: anonymous.isSemanticObjectAnonymous is not a function"
      //price: price,
      description: title
    });
  })

  const order = new Order({
    connector: connector,
    semanticId: String(id),
    number: String(id),
    date: updated_at,
    saleSession: saleSession,
    client: client,
    lines: lines
    // doNotStore?: boolean // if true, do not save the object into the connector store
  });

  console.log('create-order order is', order)
  return order;
};

export default createOrder;
