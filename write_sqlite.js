var fs = require("fs");
var file = "./test.db";

//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
//新增一個sqlite3的資料庫test.db
var db = new sqlite3.Database(file);

db.serialize(function() {
  //如果表格test01不存在，就新增test01
  db.run("CREATE TABLE IF NOT EXISTS  table_record (owner_id INTEGER, item_id INTEGER, score INTEGER, unit_id INTEGER, authenticate_id INTEGER)");
    
  //新增資料
  var sql01 = "INSERT INTO table_record(owner_id, item_id, score, unit_id, authenticate_id) VALUES (?,?,?,?,?)";
  db.run(sql01,[1, 2, 3, 4, 5]);
  
  

  
    
});

db.close();
