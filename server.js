const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "app",
  password: "app1234",
  database: "tennisdb"
});

connection.connect((error) => {
  if (error) {
    console.log("DB 연결 실패");
    return;
  }
  console.log("DB 연결 성공");
});

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.get("/orderlist", (req, res) => {
  res.sendFile(path.join(__dirname, "orderlist.html"));
});

app.get("/products", (req, res) => {
  connection.query("SELECT * FROM products ORDER BY id", (err, results) => {
    if (err) {
      res.status(500).send("조회 실패");
      return;
    }
    res.json(results);
  });
});

app.get("/order", (req, res) => {
  const productId = Number(req.query.productId);

  if (!productId) {
    res.send("productId가 없습니다.");
    return;
  }

  connection.query(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (err, rows) => {
      if (err || rows.length === 0) {
        res.send("상품을 찾을 수 없습니다.");
        return;
      }

      const product = rows[0];

      connection.query(
        "INSERT INTO orders (product_id) VALUES (?)",
        [productId],
        () => {
          res.send(`
            <h1>주문 완료</h1>
            <p>상품명: ${product.name}</p>
            <p>가격: ${product.price.toLocaleString()}원</p>
            <a href="/">메인으로 돌아가기</a><br>
            <a href="/orderlist">상품 목록 보기</a>
          `);
        }
      );
    }
  );
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
