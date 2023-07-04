import axios from 'axios';

const postOrder = async ({order, fdcAPIURL}) => {
  // TODO - Add KeyCloak authentication
  try {
    const { data } = await axios.post(`${fdcAPIURL}/orders`, order)
    return data;
  } catch (error) {
    console.warn('Failed to POST order to FDC', order, error.response);
    throw error;
  }
};

export default postOrder;