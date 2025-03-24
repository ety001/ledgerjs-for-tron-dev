import express from "express";
import ViteExpress from "vite-express";

import SpeculosTransport from "@ledgerhq/hw-transport-node-speculos";
import Trx from '@ledgerhq/hw-app-trx';

const app = express();

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.get("/transport", async (_, res) => {
  const transport = await SpeculosTransport.default.open({apduPort: 40000});
  const app = new Trx.default(transport);
  const path = `44'/195'/${0}'/0/0`;
  const appConfig = await app.getAppConfiguration();
  console.log(appConfig);
  const address = await app.getAddress(path);
  console.log(address);
  res.send(transport);
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
