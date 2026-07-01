import app from "./index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Atomos Analytics API running on port ${PORT}`);
});
