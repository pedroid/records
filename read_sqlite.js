var fs = require("fs");
var file = "./test.db";

//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
//新增一個sqlite3的資料庫test.db
var db = new sqlite3.Database(file);

db.serialize(function() {
    
  
  //查詢資料
  //var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM table_record"; 
var sql02 = "SELECT rowid AS id, owner_id, item_id, distance_id, hour, minute, second, millisecond, authenticate_id, year, month, date FROM table_record where authenticate_id == 3"; 
  db.each(sql02, function(err, row) {
console.log(row.id + ": " + row.owner_id + "," +row.item_id+","+row.distance_id+","+row.hour+","+row.minute+","+row.second+","+row.millisecond+","+row.authenticate_id+","+ row.year+","+ row.month+","+ row.date);
  });
  

  
    
});

db.close();
