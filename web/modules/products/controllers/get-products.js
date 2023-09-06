import { query } from '../../../database/connect.js';

const getProducts = async (req, res) => {
  try {
    const sql = `SELECT * FROM products`;
    const result = await query(sql);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export default getProducts;
