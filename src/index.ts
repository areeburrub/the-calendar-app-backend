import { app } from "./server";

const port = process.env.PORT || 5000;

app.route("/health").get((req, res) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
