import express from "express";
import request from "request";
import serverless from "serverless-http";

const app = express();
const port = 3000;

// Middleware для обработки CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Временное хранилище пользователей
let users = [];

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

// Эндпоинт для получения и сохранения данных от клиента
app.post("/api/submit-data", express.json(), (req, res) => {
  const { walletAddress, usdtBalance } = req.body;

  if (!walletAddress || !usdtBalance) {
    return res.status(400).send('Missing walletAddress or usdtBalance');
  }

  users.push({ walletAddress, usdtBalance });
  console.log('Received data:', { walletAddress, usdtBalance });

  res.send('Data received successfully');
});

// Эндпоинт для отображения данных в виде HTML-страницы
app.get("/api/display-data", (req, res) => {
  const htmlTableRows = users.map(user => `
    <tr>
      <td>${user.walletAddress}</td>
      <td>${user.usdtBalance}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>User Data</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 20px;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table, th, td {
          border: 1px solid black;
        }
        th, td {
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <h1>Connected Users</h1>
      <table>
        <tr>
          <th>Wallet Address</th>
          <th>USDT Balance</th>
        </tr>
        ${htmlTableRows}
      </table>
    </body>
    </html>
  `;

  res.send(htmlContent);
});

// Экспорт для serverless
module.exports = serverless(app);

// Запуск сервера для локального тестирования
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
