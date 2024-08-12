










import express from "express";
import request from "request";

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/api/crypto", (req, res) => {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${req.query.symbol}&convert=${req.query.convert}`;
  request(
    {
      url: url,
      headers: {
        "X-CMC_PRO_API_KEY": "48d81810-7c07-454d-a289-436eeb9e9743",
      },
    },
    (error, response, body) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.send(body);
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
