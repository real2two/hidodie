import env from "@/env";
import HyperExpress from "hyper-express";

export const app = new HyperExpress.Server();

app.all("*", (req, res) => {
  res.json({
    note: "testing",
  });
});

app.listen(env.TestingServerPort);
