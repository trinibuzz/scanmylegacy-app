import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "mysql.hostinger.com",
  user: "u569694274_slegacy",
  password: "Todayisgodday!54",
  database: "u569694274_mylegacy",
});