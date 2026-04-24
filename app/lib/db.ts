import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "YOUR_HOST",
  user: "slegacy",
  password: "Mychildren*54",
  database: "mylegacy",
});