import createApp from './app.js';

const port = process.env.BACKEND_PORT || process.env.PORT || '3000';

const PORT = parseInt(port, 10);

const app = await createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
