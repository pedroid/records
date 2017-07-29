var fs = require("fs");
var file = "./test.db";

//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
//新增一個sqlite3的資料庫test.db
var db = new sqlite3.Database(file);

db.serialize(function() {
    
  
  //查詢資料
  var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM table_record"; 
  db.each(sql02, function(err, row) {
    console.log(row.id + ": " + row.owner_id + "," +row.item_id+","+row.score+","+row.unit_id+","+row.authenticate_id);
  });
  

  
    
});

db.close();
