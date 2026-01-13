const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "app",
  password: "app1234",
  database: "tennisdb",
});

connection.connect((error) => {
  if (error) {
    console.log("DB 연결 실패");
    return;
  }
  console.log("DB 연결 성공");
});

app.use("/img", express.static(path.join(__dirname, "img")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.get("/order", (req, res) => {
  const productId = Number(req.query.productId);

  if (!productId) {
    res.status(400).send("productId가 없습니다.");
    return;
  }

  connection.query(
    "INSERT INTO orders (product_id) VALUES (?)",
    [productId],
    (err) => {
      if (err) {
        res.status(500).send("주문 저장 실패");
        return;
      }
      res.redirect("/orderlist");
    }
  );
});

app.get("/orderlist", (req, res) => {
  const sql = `
    SELECT o.id AS orderId, p.name, p.price, o.created_at
    FROM orders o
    JOIN products p ON o.product_id = p.id
    ORDER BY o.id DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      res.status(500).send("주문내역 조회 실패");
      return;
    }

    let rows = results
      .map(
        (r) => `
          <tr>
            <td>${r.orderId}</td>
            <td>${r.name}</td>
            <td>${r.price}</td>
            <td>${r.created_at}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Order List</title>
        </head>
        <body>
          <h1>Order List</h1>
          <table border="1" cellpadding="8">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${rows || "<tr><td colspan='4'>주문 내역 없음</td></tr>"}
            </tbody>
          </table>
          <br/>
          <a href="/">메인으로</a>
        </body>
      </html>
    `;

    res.send(html);
  });
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
