import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_road",
  password: "safvan13",
  port: 5432,
});
db.connect();
app.set("view engine", "ejs");
app.use(express.static("./public"));

app.use(express.urlencoded({ extended: true }));

async function getDataList() {
  try {
    const data = await db.query("SELECT * FROM books");
    return data.rows;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

app.get("/", async (req, res) => {
  try {
    const data = await getDataList();
    res.render("index.ejs", { books: data });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/user", (req, res) => {
  try {
    const isbn = req.body["ISBN"];
    const cover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    res.render("review.ejs", { cover, isbn });
  } catch (err) {
    console.log(err);
  }
});

app.post("/review", async (req, res) => {
  const { isbn, name, author, review} = req.body;
  const cover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

  try {
    await db.query(
      "INSERT INTO books(isbn,author,review,name,book_cover) VALUES($1,$2,$3,$4,$5)",
      [isbn, author, review, name, cover]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.render("review.ejs", { cover, isbn });
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    await db.query(`DELETE FROM BOOKS WHERE id=${req.params.id}`);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    const result = await db.query("SELECT * FROM books WHERE id=$1", [bookId]);
    const book = result.rows[0];
    res.render("edit.ejs", { book });
  } catch (err) {
    console.error("Error fetching book data:", err);
    res.status(500).send(" Server Error");
  }
});
app.post("/edit/:id", async (req, res) => {
  const bookId = req.params.id;
  const { isbn, name, author, review } = req.body;

  try {
    await db.query(
      "UPDATE books SET isbn=$1, author=$2, review=$3, name=$4 WHERE id=$5",
      [isbn, author, review, name, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
