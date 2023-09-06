import UseCases from '../use-cases/index.js';

const getFDCProducts = async (req, res, next) => {
  console.log('getFDCProducts----------------------------------');

  try {
    const products = await UseCases.getFDCProducts();
    console.log('getFDCProducts products', products);
    console.log('FDC products are', products);
    res.set('content-type', 'application/ld+json');
    return res.status(200).send(products);
    //return res.status(200).json(products);
  } catch (error) {
    console.warn('Error getting FDC products', error);
    return next(error);
  }
};

export default getFDCProducts;
