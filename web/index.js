import app from './app.js';

// const port = process.env.BACKEND_PORT || process.env.PORT || '3000';

// const PORT = parseInt(port, 10);
const PORT = 58939;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
