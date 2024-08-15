import express from "express";
import request from "request";

const app = express();
const port = 3000;

// Middleware для обработки CORS и JSON
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Временное хранилище пользователей в формате Map
const walletData = new Map();

// Эндпоинт для получения данных о криптовалюте
app.get("/api/crypto", (req, res) => {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${req.query.symbol}&convert=${req.query.convert}`;
  request(
    {
      url: url,
      headers: {
        "X-CMC_PRO_API_KEY": "73123050-db8f-430f-9815-0ea4367ced21",
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

app.post("/api/wallet-balance", (req, res) => {
  const { wallet, balance } = req.body;

  if (!wallet || typeof balance !== "number") {
    return res.status(400).send("Invalid data.");
  }

  const normalizedWallet = wallet.trim().toLowerCase();

  // Обновление или добавление данных в Map
  walletData.set(normalizedWallet, balance);

  res.send(`Кошелек ${normalizedWallet} обновлен с балансом: ${balance}`);
});

app.get("/api/view-balances", (req, res) => {
  const tableRows = Array.from(walletData.entries())
    .map(
      ([wallet, balance]) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${wallet}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${balance} USDT</td>
        </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wallet Balances</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: "Roboto", sans-serif;
          background-color: #f5f5f5;
        }
        table {
          border-collapse: collapse;
          width: 60%;
          margin-top: 50px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          background-color: #fff;
        }
        th {
          padding: 12px;
          text-align: left;
          background-color: #3f51b5;
          color: white;
          font-size: 18px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:hover {
          background-color: #f1f1f1;
        }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <th>Wallet Address</th>
          <th>Balance</th>
        </tr>
        ${tableRows}
      </table>
    </body>
    </html>
  `;

  res.send(html);
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
