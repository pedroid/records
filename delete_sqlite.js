var fs = require("fs");
var file = "./test.db";

//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
//新增一個sqlite3的資料庫test.db
var db = new sqlite3.Database(file);

db.serialize(function() {
    
  //刪除資料
  var sql04 = "delete from table_authenticate_type where rowid = 1";
  db.run(sql04);  
  
  //查詢資料
  var sql02 = "SELECT rowid AS id, authenticate_name FROM table_authenticate_type"; 
  db.each(sql02, function(err, row) {
    console.log(row.id + ": " + row.authenticate_name);
  });
  

  
    
});

db.close();
