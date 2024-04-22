import axios from 'axios';
import exportDFCConnectorOrder, {
  exportDFCConnectorCustomer
} from '../../connector/orderUtils.js';
import { throwError } from '../../utils/index.js';

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

export const sendOrderToProducer = async ({
  orderType,
  activeSalesSessionOrderId,
  variants = [],
  customer
}) => {
  const lineItems = variants.map((variant) => ({
    variant_id: Number(variant.mappedProducerVariantId),
    quantity: variant.numberOfPackages
  }));

  if (!lineItems.length) {
    throwError('sendOrderToProducer: No line items found in the payload');
  }

  const shopifyOrder = {
    id: activeSalesSessionOrderId,
    lineItems,
    customer
  };

  const exportedOrder = await exportDFCConnectorOrder(shopifyOrder);
  const exportedCustomer = await exportDFCConnectorCustomer(shopifyOrder);

  try {
    const { data } = await axios.patch(
      `${PRODUCER_SHOP_URL}fdc/orders/${activeSalesSessionOrderId}?shop=${PRODUCER_SHOP}&orderType=${orderType}`,
      {
        orderId: activeSalesSessionOrderId,
        exportedOrder,
        exportedCustomer
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PRODUCER_API_KEY}`
        }
      }
    );
    return data.order.id;
  } catch (err) {
    throwError(
      'sendOrderToProducer: Error occurred while sending the order to producer',
      err
    );
  }
};
