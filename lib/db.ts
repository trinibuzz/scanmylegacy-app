import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "u569694274_abauer",
  password: "Mychildren*54",
  database: "u569694274_mylegacy",
});