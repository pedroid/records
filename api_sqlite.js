exports.read = function(db, table_name){
	console.log('read');
//	this.forfun();
	db.serialize(function() {
  
	  //查詢資料
	  var sql02 = "SELECT  owner_id, item_id, score, unit_id, authenticate_id, FROM " + table_name + ";"; 
	  db.each(sql02, function(err, row) {
	    console.log(  row.owner_id);
	  });
    
});
}
exports.system_check_user = function(db, req, res, username_input, password_input){
	var self = this;
	var user = '';
	var passwd = '';
	//var sql = "SELECT rowid AS id, password FROM table_user WHERE user_name=="+username;
	var sql = "SELECT rowid AS id, user_name, password  FROM table_user where user_name='"+username_input+"';";
	  db.each(sql, 
		  function(err, row) {
			if(err){
				console.log(err);
				
			}else{
				self.user = username_input;
				self.passwd = row.password;
				self.user_id = row.id;
				//console.log('#'+row.id + ',' + row.user_name + ','+ row.password+ ' found.');	
			}
	  	  }, function(){
				if(self.user){
					if(password_input == self.passwd){
						//console.log('user:'+self.user + ' found.');
						req.session.user = username_input;
						req.session.user_id = self.user_id;
						//console.log('user id:'+self.user_id);
						res.redirect('/profile');
					}else{
						req.session.user = '';
						console.log('wrong password');
						res.redirect('/');
					}
				}else{
					console.log(username_input+' not found');
					req.session.user = '';
					res.redirect('/');
					
				}
				//req.session.user = req.body.user;
	   	  });
	//req.session.user = req.body.user;
	//res.redirect('/');
}
exports.admin_delete_record = function(db, record_id, req, res){

	db.serialize(function(){
		var sql = "DELETE FROM table_record WHERE rowid=" + record_id;
		db.run(sql, function(err){
			res.redirect('/admin/records/');	
		});
	});
}
exports.admin_delete_authenticate = function(db, authenticate_id, req, res){

	db.serialize(function(){
		var sql = "DELETE FROM table_authenticate_type WHERE rowid=" + authenticate_id;
		console.log(sql);
		db.run(sql, function(err){
			res.redirect('/admin/authenticate/');	
		});
	});
}

exports.admin_delete_item = function(db, item_id, req, res){

	db.serialize(function(){
		var sql = "DELETE FROM table_item WHERE rowid=" + item_id;
		db.run(sql, function(err){
			res.redirect('/admin/items/');	
		});
	});
}

exports.admin = function(db, req, res){

	var self = this;
	var obj_to_render = {user: req.session.user};
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
		  var sql = "";	
		  db.each(sql, 
			  function(err, row) {},
			  function(){
				  self.admin_rendering(res, self.obj_to_render);
			  });
		});
}
exports.admin_rendering = function(res, obj_to_render){
	res.render('admin.ejs', obj_to_render);
}

exports.admin_new_authenticate = function(db, req, res){

	var self = this;
	var obj_to_render = {user: req.session.user};
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
		  var sql = "";	
		  db.each(sql, 
			  function(err, row) {},
			  function(){
				  self.admin_new_authenticate_rendering(res, self.obj_to_render);
			  });
		});
}
exports.admin_new_authenticate_rendering = function(res, obj_to_render){


		res.render('admin/new_authenticate.ejs',
			obj_to_render
		);
}

exports.admin_new_items = function(db, req, res){

	var self = this;
	var obj_to_render = {user: req.session.user};
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
		  var sql = "";	
		  db.each(sql, 
			  function(err, row) {},
			  function(){
				  self.admin_new_items_rendering(res, self.obj_to_render);
			  });
		});
}

exports.admin_new_items_rendering = function(res, obj_to_render){
	res.render('admin/new_item.ejs', obj_to_render);
	
}
exports.public_register = function(req, res){
	res.render('register.ejs');
}
exports.public_register_post = function(db, req, res){
	var self = this;
	if(req.body.password == req.body.password_confirm){
		db.serialize(function(){
			var lastID;
			var sql = "INSERT INTO table_user (user_name, password) VALUES (?,?)";
			var sql_total_number = "SELECT Count(*) FROM table_user";
			db
			.each("CREATE TABLE IF NOT EXISTS table_user (user_name TEXT, password TEXT)")
			.each(sql, [req.body.user, req.body.password])
			.each(sql_total_number,
				function(err, result){
					lastID = result['Count(*)'];
					console.log(lastID);	
				},
				function(){
					self.lastID = lastID;
					req.session.user_id = self.lastID;
					req.session.user = req.body.user;
					res.redirect('/profile');
				}
			);
			
		}); //end of db.serialize
		
	}else{
		console.log('password not match');
		res.redirect('/');
	}
}
exports.admin_new_user_post = function(db, req, res){

	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS table_user (user_name TEXT, password TEXT)");
		var sql = "INSERT INTO table_user (user_name, password) VALUES (?,?)";
		db.run(sql, [req.body.user, req.body.password]);
	});
	res.redirect('/admin/users/');
}

exports.admin_delete_user = function(db, user_id, req, res){

	db.serialize(function(){
		var sql = "DELETE FROM table_user WHERE rowid=" + user_id;
		var sql_record = "DELETE FROM table_record WHERE owner_id==" + user_id;
		db.run(sql)
		.run(sql_record, function(err){	
			res.redirect('/admin/users/');	
		});
	});
}
exports.admin_new_records = function(db, req, res){
	var self = this;
	var obj_to_render = {user: req.session.user};
	db.serialize(function() {
		  var items_set = {};
		  var authenticates_set = {};
		  var distances_set = {};
	 	  var users_set = [];
		  //查詢資料
		  var sql = "SELECT rowid AS id, user_name FROM table_user"; 
		  var sql_item = "SELECT rowid AS id, item_name FROM table_item"; 
		  var sql_authenticate = "SELECT rowid AS id, authenticate_name FROM table_authenticate_type"; 
		  var sql_distance = "SELECT rowid AS id, distance_name FROM table_distance"; 
		  db
			.each(sql_distance, function(err, row){
				if(err){
					console.log(err);
					res.end();
				}else{}
				distances_set[row.id] = row.distance_name;
			})
			.each(sql_authenticate, function(err, row){
				if(err){
					console.log(err);
					res.end();
				}else{}
				authenticates_set[row.id] = row.authenticate_name;
			})
			.each(sql_item, function(err, row){
				if(err){
					console.log(err);
					res.end();
				}else{}
				items_set[row.id] = row.item_name;
			})
			.each(sql, function(err, row) {
				if(err){
					console.log(err);
					res.end();
				}else{
				
				}
				users_set.push({
					user_id:row.id, 
					user_name:row.user_name,
				});
				self.obj_to_render = {
					user: req.session.user,
					users_set: users_set,
					items_set: items_set,
					authenticates_set: authenticates_set,
					distances_set: distances_set
				};


		}, function(){
		
		  self.admin_new_records_rendering(res, self.obj_to_render);
		});
	});

}

exports.admin_new_record_post = function(db, req, res){
	db.serialize(function() {
		  //如果表格test01不存在，就新增test01
		  db.run("CREATE TABLE IF NOT EXISTS  table_record (owner_id INTEGER, item_id INTEGER, distance_id INTEGER, hour INTEGER, minute INTEGER, second INTEGER, millisecond INTEGER, authenticate_id INTEGER, year INTEGER, month INTEGER, date INTEGER)");
		    
		  //新增資料
		  var sql01 = "INSERT INTO table_record(owner_id, item_id, distance_id, hour, minute, second, millisecond,  authenticate_id, year, month, date) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
		  db.run(sql01,[req.body.owner_id, req.body.item_id, req.body.distance_id, req.body.hour, req.body.minute, req.body.second, req.body.millisecond, req.body.authenticate_id, req.body.year, req.body.month, req.body.date]);
		 res.redirect('/admin/records/');

	});
}
exports.admin_new_records_rendering = function(res, obj_to_render){
	res.render('admin/new_record.ejs', obj_to_render);
};

exports.private_load_records = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	console.log('user_id:'+req.session.user_id);
	//var sql02 = "SELECT rowid AS id, owner_id, item_id, distance_id, hour, minute, second, millisecond, authenticate_id, year, month, date FROM table_record"; 
	var sql02 = "SELECT rowid AS id, owner_id, item_id, distance_id, hour, minute, second, millisecond, authenticate_id, year, month, date FROM table_record where owner_id=="+req.session.user_id; 
	//var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM table_record"; 
	var records_set = [];
	var items_set = {};
	var authenticates_set = {};
	var distances_set = {};
	var users_set = {};
	var user_id_list = [];
	//查詢資料
	var sql_user = "SELECT rowid AS id, user_name FROM table_user"; 
	var sql_item = "SELECT rowid AS id, item_name FROM table_item"; 
	var sql_authenticate = "SELECT rowid AS id, authenticate_name FROM table_authenticate_type"; 
	var sql_distance = "SELECT rowid AS id, distance_name FROM table_distance"; 
	db
		.each(sql_distance, function(err, row){
			if(err){
				console.log('sql_distance:'+err);
				res.end();
			}else{}
			distances_set[row.id] = row.distance_name;
		})
		.each(sql_authenticate, function(err, row){
			if(err){
				console.log('sql_auth:'+err);
				res.end();
			}else{}
			authenticates_set[row.id] = row.authenticate_name;
		})
		.each(sql_item, function(err, row){
			if(err){
				console.log('sql_item:'+err);
				res.end();
			}else{}
			items_set[row.id] = row.item_name;
		})
	  	.each(sql02, function(err, row) {
			if(err){
				console.log('sql02:'+err);
				res.end();
			}else{
				if(user_id_list.length == 0){
					user_id_list.push(row.owner_id);
				//	console.log('no element in list, so push it');
					sql_user+= " where user == " + row.owner_id;
				}else{
					if(user_id_list.indexOf(row.owner_id) != -1){
						//do nothing
				//		console.log('already existed, so skip');
				//		console.log('user_id_list:'+user_id_list);
					}else{
						user_id_list.push(row.owner_id);
						//sql_user+= "where id=="+row.owner_id;
				//		console.log('not existed in list, so push it');
				//		console.log('user_id_list:'+user_id_list);
						sql_user+= " or where user == " + row.owner_id;
					}
				}
				records_set.push({
					id:row.id,
					owner_id: row.owner_id,
					item_id: row.item_id,
					distance_id: row.distance_id,
					hour: row.hour,
					minute: row.minute,
					second: row.second,
					millisecond: row.millisecond,
					authenticate_id: row.authenticate_id,
					month: row.month,
					date: row.date
				});
			   // console.log(row.id + ": " + row.owner_id + "," +row.item_id+","+row.distance_id+","+row.hour+","+row.minute+","+row.second+","+row.millisecond+","+row.authenticate_id+","+ row.year+","+ row.month+","+ row.date);
			}
		})
		.each(sql_user, function(err, row){
			users_set[row.id] = row.user_name;
			//console.log(row.user_name);
		}, function(){
	//	console.log('user_id_list:'+user_id_list);
		//console.log(users_set);
		self.obj_to_render.users_set = users_set;
		self.obj_to_render.records_set = records_set;
		self.obj_to_render.items_set = items_set;
		self.obj_to_render.authenticates_set = authenticates_set;
		self.obj_to_render.distances_set = distances_set;
		
		res.render('profile.ejs', self.obj_to_render);
	} );
}
exports.public_load_records = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	var sql02 = "SELECT rowid AS id, owner_id, item_id, distance_id, hour, minute, second, millisecond, authenticate_id, year, month, date FROM table_record where authenticate_id == 3"; 
	//var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM table_record"; 
	var records_set = [];
	var items_set = {};
	var authenticates_set = {};
	var distances_set = {};
	var users_set = {};
	var user_id_list = [];
	//查詢資料
	var sql_user = "SELECT rowid AS id, user_name FROM table_user"; 
	var sql_item = "SELECT rowid AS id, item_name FROM table_item"; 
	var sql_authenticate = "SELECT rowid AS id, authenticate_name FROM table_authenticate_type"; 
	var sql_distance = "SELECT rowid AS id, distance_name FROM table_distance"; 
	db
		.each(sql_distance, function(err, row){
			if(err){
				console.log(err);
				res.end();
			}else{}
			distances_set[row.id] = row.distance_name;
		})
		.each(sql_authenticate, function(err, row){
			if(err){
				console.log(err);
				res.end();
			}else{}
			authenticates_set[row.id] = row.authenticate_name;
		})
		.each(sql_item, function(err, row){
			if(err){
				console.log(err);
				res.end();
			}else{}
			items_set[row.id] = row.item_name;
		})
	  	.each(sql02, function(err, row) {
			if(err){
				console.log(err);
				res.end();
			}else{
				if(user_id_list.length == 0){
					user_id_list.push(row.owner_id);
				//	console.log('no element in list, so push it');
					sql_user+= " where user == " + row.owner_id;
				}else{
					if(user_id_list.indexOf(row.owner_id) != -1){
						//do nothing
				//		console.log('already existed, so skip');
				//		console.log('user_id_list:'+user_id_list);
					}else{
						user_id_list.push(row.owner_id);
						//sql_user+= "where id=="+row.owner_id;
				//		console.log('not existed in list, so push it');
				//		console.log('user_id_list:'+user_id_list);
						sql_user+= " or where user == " + row.owner_id;
					}
				}
				records_set.push({
					id:row.id,
					owner_id: row.owner_id,
					item_id: row.item_id,
					distance_id: row.distance_id,
					hour: row.hour,
					minute: row.minute,
					second: row.second,
					millisecond: row.millisecond,
					authenticate_id: row.authenticate_id,
					month: row.month,
					date: row.date
				});
			   // console.log(row.id + ": " + row.owner_id + "," +row.item_id+","+row.distance_id+","+row.hour+","+row.minute+","+row.second+","+row.millisecond+","+row.authenticate_id+","+ row.year+","+ row.month+","+ row.date);
			}
		})
		.each(sql_user, function(err, row){
			users_set[row.id] = row.user_name;
			//console.log(row.user_name);
		}, function(){
	//	console.log('user_id_list:'+user_id_list);
		//console.log(users_set);
		self.obj_to_render.users_set = users_set;
		self.obj_to_render.records_set = records_set;
		self.obj_to_render.items_set = items_set;
		self.obj_to_render.authenticates_set = authenticates_set;
		self.obj_to_render.distances_set = distances_set;
		
		res.render('index.ejs', self.obj_to_render);
	} );
}
exports.admin_load_records = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	var sql02 = "SELECT rowid AS id, owner_id, item_id, distance_id, hour, minute, second, millisecond, authenticate_id, year, month, date FROM table_record"; 
	//var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM table_record"; 
	db.each(sql02, function(err, row) {
		if(err){
			console.log(err);
			res.end();
		}else{
		    console.log(row.id + ": " + row.owner_id + "," +row.item_id+","+row.distance_id+","+row.hour+","+row.minute+","+row.second+","+row.millisecond+","+row.authenticate_id+","+ row.year+","+ row.month+","+ row.date);
		}
  	} );
	res.end();
}
	
exports.admin_load_records_rendering = function(res, obj_to_render){
		res.render('admin/records.ejs', obj_to_render);
}

exports.admin_new_todos = function(db, req, res){
	var self = this;
	var obj_to_render = {user: req.session.user};
	db.serialize(function() {
	
	 	  var todos_set = [];
		  //查詢資料
		  var sql = "SELECT rowid AS id, todo_name FROM table_todo"; 
		  db.each(sql, function(err, row) {
			if(err){
				console.log(err);
				res.end();
			}else{
			
			}
			todos_set.push({
				todo_id:row.id, 
				todo_name:row.todo_name
			});
			obj_to_render = {
				user: req.session.user,
				todos_set: todos_set
			};

		}, function(){
		  self.admin_new_todos_rendering(res, self.obj_to_render);
		});
	});

}

exports.admin_new_todos_rendering = function(res, obj_to_render){
	res.render('admin/new_todo.ejs', obj_to_render);
};


exports.admin_load_todos = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
	
	  //如果表格test01不存在，就新增test01
 	  var todos_set = [];
	  //查詢資料
	 
	 

	  var sql = "SELECT rowid AS id, todo_name FROM table_todo"; 
	  self.obj_to_render.todos_set = {};
	  db.each(sql, 
		  function(err, row) {
			if(err){
				console.log(err);
			}else{
			  	todos_set.push({
					todo_id:row.id, 
					todo_name: row.todo_name
				});
			}
			self.obj_to_render.todos_set = todos_set;
	  	  }, function(){
			self.admin_load_todos_rendering(res, self.obj_to_render);
	   	  });
	});
}
exports.admin_load_todos_rendering = function(res, obj_to_render){
		res.render('admin/todos.ejs', obj_to_render);
}

exports.admin_new_user = function(req, res){
	res.render('admin/new_user.ejs');
};

exports.admin_new_users_rendering = function(res, obj_to_render){
	res.render('admin/new_user.ejs', obj_to_render);
};


exports.admin_load_users = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
	
	  //如果表格test01不存在，就新增test01
 	  var users_set = [];
	  //查詢資料
	 
	 

	  var sql = "SELECT rowid AS id, user_name, password FROM table_user"; 
	  self.obj_to_render.users_set = {};
	  db.each(sql, 
		  function(err, row) {
			if(err){
				console.log(err);
			}else{
			  	users_set.push({
					user_id:row.id, 
					user_name: row.user_name,
					password: row.password
				});
			}
	  	  }, function(){
			self.obj_to_render.users_set = users_set;
			self.admin_load_users_rendering(res, self.obj_to_render);
	   	  });
	});
}
exports.admin_load_users_rendering = function(res, obj_to_render){
		res.render('admin/users.ejs', obj_to_render);
}
exports.admin_new_distance = function(db, req, res){
	var self = this;
	var obj_to_render = {user: req.session.user};
	self.admin_new_distances_rendering(res, self.obj_to_render);

}
exports.admin_new_distance_post = function(db, req, res){

	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS table_distance (distance_name TEXT)");
		var sql = "INSERT INTO table_distance (distance_name) VALUES (?)";
		db.run(sql, [req.body.distance]);
	});
	res.redirect('/admin/distances/');
}

exports.admin_new_distances_rendering = function(res, obj_to_render){
	res.render('admin/new_distance.ejs', obj_to_render);
};


exports.admin_load_distances = function(db, req, res){
	var self = this;
	var obj_to_render;
	if(req.session.user){
		self.obj_to_render = {user: req.session.user};
	}else{
		self.obj_to_render = {user: ''};
	}
	db.serialize(function() {
	
	  //如果表格test01不存在，就新增test01
 	  var distances_set = [];
	  //查詢資料
	 
	 

	  var sql = "SELECT rowid AS id, distance_name FROM table_distance"; 
	  self.obj_to_render.distances_set = {};
	  db.each(sql, 
		  function(err, row) {
			if(err){
				console.log(err);
			}else{
			  	distances_set.push({
					distance_id:row.id, 
					distance_name: row.distance_name,
				});
			}
	  	  }, function(){
			self.obj_to_render.distances_set = distances_set;
			self.admin_load_distances_rendering(res, self.obj_to_render);
	   	  });
	});
}
exports.admin_load_distances_rendering = function(res, obj_to_render){
		res.render('admin/distances.ejs', obj_to_render);
}
exports.admin_delete_distance = function(db, distance_id, req, res){

	db.serialize(function(){
		var sql = "DELETE FROM table_distance WHERE rowid=" + distance_id;
		db.run(sql, function(err){
			res.redirect('/admin/distances/');	
		});
	});
}
