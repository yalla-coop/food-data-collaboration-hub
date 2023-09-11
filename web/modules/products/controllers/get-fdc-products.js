import axios from 'axios';

const PRODUCER_SHOP_URL =
  process.env.PRODUCER_SHOP_URL || 'http://localhost:51063/';
const PRODUCER_SHOP =
  process.env.PRODUCER_SHOP || 'test-hodmedod.myshopify.com';
const getFDCProducts = async (req, res, next) => {
  const { nextPageCursor } = req.query;

  const user = req.user;
  const accessToken = user.accessToken;

  try {
    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products?shop=${PRODUCER_SHOP}&nextPageCursor=${nextPageCursor}`,
      {
        userId: user.id,
        accessToken: accessToken
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

export default getFDCProducts;
