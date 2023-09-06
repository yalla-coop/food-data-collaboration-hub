import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.BACKEND_PORT || process.env.PORT || '3000';

const PORT = parseInt(port, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
