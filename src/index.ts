import { app } from "./server";

const port = parseInt(process.env.PORT || "5000");

app.route("/health").get((req, res) => {
  res.send("OK");
});

app.listen(port, 'localhost', () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
