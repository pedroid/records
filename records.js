var im = require('imagemagick')
var busboy = require('connect-busboy')
var express = require('express')
var http = require('http')
var url = require('url')
var fs = require('fs')
var io = require('socket.io')
var hp = 0;
var message_content;
var app = express();
var server = http.createServer(app);
var qs = require('querystring');
var util = require('util');
var design_pattern = require('./design_pattern_engine.js');
var Passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var BodyParser = require('body-parser');
var obj2html = require('./obj2html.js');
var render_user = require('./user_template.js');
var session = require('express-session');
var api_sqlite = require('./api_sqlite.js');

var file = "./test.db";
//載入 sqlite3
var sqlite3 = require("sqlite3").verbose();
//新增一個sqlite3的資料庫test.db
var db = new sqlite3.Database(file);

//db.close();
var users = {
	yushengc:{
		user:'yushengc',
		password:'1234',
		id:1,	
	},
	guest:{
		user:'guest',
		password:'5678',
		id:2,
	},
}

var table_records = [
	{owner_id: 0, item_id: 0,  score:20, unit_id:0, authenticate_id: 0},
	{owner_id: 1, item_id: 0, score:22, unit_id:0, authenticate_id: 1},
	{owner_id: 3, item_id: 1, score:18, unit_id:0, authenticate_id: 0}
];

var table_items = {
	0: 'running around itri',
	1: 'running around campus'
};

var table_owners = {
	 0: 'yushengc',
	 1: 'ruby',		
	 3: 'ic'
};

var table_units = {
	 0: 'min' 
};



var localStrategy = new LocalStrategy({
      usernameField: 'user',
      passwordField: 'password',
    },
    function(username, password, done) {
//	console.log('username:'+username);
      user = users[ username ];
 
      if ( user == null ) {
        return done( null, false, { message: 'Invalid user' } );
      };
 
      if ( user.password !== password ) {
        return done( null, false, { message: 'Invalid password' } );
      };
 
      done( null, user );
    }
)
 
Passport.use( 'local', localStrategy );
Passport.serializeUser(function(user, done){
	done(null, user);
});

Passport.deserializeUser(function(user, done){
	done(null, user);
});
app.use( BodyParser.urlencoded( { extended: false } ) );
app.use( BodyParser.json() );

app.use(session({
	secret:'ilovekiro',
//	cookie:{
//		maxAge:30*1000
//	},
	resave:true,
	saveUninitialized: true
}));

app.use( Passport.initialize() );
app.use( Passport.session());
app.get('/logout', function(req, res){
	req.logOut();
	req.session.destroy(function(err){
		res.redirect("/");
	});
//	res.redirect("/login.html");
});
app.get('/profile',function(req, res){
	if(req.session.user){
		api_sqlite.profile_load_records(db, req, res);
	}else{
		res.redirect('/');
	}
});
app.get('/register',function(req, res){
	api_sqlite.public_register(req, res);
});
app.get('/admin/distances', function(req, res){	
	api_sqlite.admin_load_distances(db, req, res);
});
app.get('/admin/distances/new/',function(req, res){
	api_sqlite.admin_new_distance(db, req, res);
});
app.get('/admin/distances/delete/:id', function(req, res){
	api_sqlite.admin_delete_distance(db, req.params['id'], req, res);
});
app.get('/admin/users', function(req, res){	
	api_sqlite.admin_load_users(db, req, res);
});
app.get('/admin/users/new/',function(req, res){
	api_sqlite.admin_new_user(req, res);
});
app.get('/admin/records/delete/:id', function(req, res){
	api_sqlite.admin_delete_record(db, req.params['id'], req, res);
});
app.get('/profile/records/delete/:id', function(req, res){
	api_sqlite.profile_delete_record(db, req.params['id'], req, res);
});
app.get('/profile/records/edit/:id', function(req, res){
	if(req.session.user){
		api_sqlite.profile_edit_record(db, req.params['id'], req, res);
	}else{
		res.redirect('/');
	}
});
app.get('/admin/items/delete/:id', function(req, res){
	api_sqlite.admin_delete_item(db, req.params['id'], req, res);
});
app.get('/admin/authenticate/delete/:id', function(req, res){
	api_sqlite.admin_delete_authenticate(db, req.params['id'], req, res);
});
app.get('/admin/',function(req, res){
	api_sqlite.admin(db, req, res);
});

app.get('/admin/users', function(req, res){	
	api_sqlite.admin_load_users(db, req, res);
});
app.get('/admin/users/new/',function(req, res){
	api_sqlite.admin_new_user(db, req, res);
});
app.get('/admin/users/delete/:id', function(req, res){
	api_sqlite.admin_delete_user(db, req.params['id'], req, res);
});
app.get('/admin/todos', function(req, res){	
	api_sqlite.admin_load_todos(db, req, res);
});
app.get('/admin/todos/new/',function(req, res){
	api_sqlite.admin_new_todos(db, req, res);
});
app.get('/admin/records', function(req, res){	
	api_sqlite.admin_load_records(db, req, res);
});
app.get('/profile/records/new/',function(req, res){
	if(req.session.user){
		api_sqlite.profile_new_records(db, req, res);
	}else{
		res.redirect('/');
	}
});
app.get('/admin/records/new/',function(req, res){
	api_sqlite.admin_new_records(db, req, res);
});
app.get('/admin/items/new', function(req, res){
	api_sqlite.admin_new_items(db, req, res);
});

app.get('/admin/authenticate/new', function(req, res){
	api_sqlite.admin_new_authenticate(db, req, res);

});
app.get('/admin/items', function(req, res){	
	db.serialize(function() {
	
	 	  var items_set = [];
		  //查詢資料
		  sql = "SELECT rowid AS id, item_name FROM table_item"; 
		  db.each(sql, function(err, row) {
			if(err){
				console.log(err);
				res.end();
			}else{
			
			     items_set.push({item_id:row.id, item_name:row.item_name});
			}

		}).each(sql,function(err, row){

		},function(){
			res.render('admin/items.ejs',
			{user:req.session.user,  items_set: items_set});
		});
	});


});
app.get('/admin/authenticate', function(req, res){	
	db.serialize(function() {
	
		  //如果表格test01不存在，就新增test01
	 	  var authenticates_set = [];
		  //查詢資料
		  sql = "SELECT rowid AS id, authenticate_name FROM table_authenticate_type"; 
		  db.each(sql, function(err, row) {
			if(err){
				console.log(err);
				res.end();
			}else{
			
			}
			  authenticates_set.push({authenticate_id:row.id, authenticate_name:row.authenticate_name});

		},function(){
			res.render('admin/authenticate.ejs',
			{user:req.session.user,  authenticates_set: authenticates_set});
		}
	
		).each(sql,function(err, row){

		},function(){
		//	res.render('admin/authenticate.ejs',
		//	{user:req.session.user,  authenticates_set: authenticates_set});
		});
	});


});
//home
app.get('/', function(req, res){
	api_sqlite.public_load_records(db, req, res);
});
app.get('/session', function(req, res, next) {
	console.log(req.session);
	if(req.session.isvisit) {
		console.log(req.session.id);
		console.log(req.session);
		req.session.count += 1;
		res.send("这是你第"+req.session.count+"来访");
	} else {
		req.session.user = "kiro";
		console.log(req.session.user);
		req.session.count = 1;	//第几次访问
		req.session.isvisit = true;
		res.send('first time');
	}		
});

app.get('/new.html',function(req, res){
	if(req.session.user){	
		res.render('new.ejs',
			{user: req.session.user, table_records: table_records, table_units: table_units, table_authenticates: table_authenticates, table_owners: table_owners, table_items: table_items}
		);
	
	}else{
		res.redirect('/');
	}
});
app.get('/register.html', function(req, res){
	res.render('register.ejs');	
});
app.get('/login.html', function(req, response, next) {
	response.render('login.ejs');
});
app.get('/user',
	function(req, res){
		console.log('user:'+req.session.user);
		//req.session.user = user.user;
		if(req.session.user){
		
			db.serialize(function() {
			  //如果表格test01不存在，就新增test01
			  db.run("CREATE TABLE IF NOT EXISTS  table01 (name TEXT,remark TEXT)");
    
			  //新增資料
			  var sql01 = "INSERT INTO table01(name,remark) VALUES (?,?)";
			  db.run(sql01,[req.session.user,"ddd"]);  
  
  			//如果表格test01不存在，就新增test01
			  db.run("CREATE TABLE IF NOT EXISTS  table01 (name TEXT,remark TEXT)");
  
			  //查詢資料
			  var sql02 = "SELECT rowid AS id, name,remark FROM table01"; 
			  db.each(sql02, function(err, row) {
			    console.log(row.id + ": " + row.name);
			  });
    
			});

		if(req.session.isvisit){
		//console.log(req.session.id);
		//console.log(req.session);
		req.session.count += 1;
//		res.send("hi "+ req.session.user  +",这是你第"+req.session.count+"来访");

		res.render(
			'user.ejs',
			{quotes: req.session.user});

		}else{//first
			
		//req.session.user = "kiro";
		console.log(req.session.user);
		req.session.count = 1;	//第几次访问
		req.session.isvisit = true;
//		res.send('hi '+ req.session.user +',first time');

		res.render(
			'user.ejs',
			{quotes: req.session.user});

		}
		/*
		res.render(
			'index.ejs',
			{quotes: req.session.user});
		*/
		//res.end();
		}else{

			console.log("user undefined, redirect to login page");
			res.redirect('/login.html');
		}
	}
)

app.get('/user/:id', 
	
	
	function(req, res){
	console.log('req.user:'+req.params['id']);
	res.render(
		'index.ejs', 
		{quotes: req.params['id']}
	);
	}
	

);
app.post('/register', function(req, res){
	api_sqlite.public_register_post(db, req, res);
});
app.post('/admin/distances/new', function(req, res){
	api_sqlite.admin_new_distance_post(db, req, res);
});
app.post('/admin/users/new', function(req, res){
	api_sqlite.admin_new_user_post(db, req, res);
});
app.post('/admin/todos/new', function(req, res){
	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS table_todo (todo_name TEXT)");
		var sql = "INSERT INTO table_todo (todo_name) VALUES (?)";
		db.run(sql, [req.body.todo]);
	});
	res.redirect('/admin/todos/');
});
app.post('/admin/items/new/item_new', function(req, res){
	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS table_item (item_name TEXT)");
		var sql = "INSERT INTO table_item (item_name) VALUES (?)";
		db.run(sql, [req.body.item]);
	});
	res.redirect('/admin/items/');
});
app.post('/admin/authenticate/new/authenticate_new', function(req, res){
	console.log(req.body.authenticate);
	db.serialize(function(){
		db.run("CREATE TABLE IF NOT EXISTS table_authenticate_type (authenticate_name TEXT)");
		var sql = "INSERT INTO table_authenticate_type (authenticate_name) VALUES (?)";
		db.run(sql, [req.body.authenticate]);
	});
	res.redirect('/admin/authenticate/');
});

app.post('/profile/records/record_edit', function(req, res){
	api_sqlite.profile_edit_record_post(db, req, res);
});
app.post('/profile/records/record_new', function(req, res){
	api_sqlite.profile_new_record_post(db, req, res);
});
app.post('/admin/records/swim_record_new', function(req, res){
	api_sqlite.admin_new_record_post(db, req, res);
});
app.post('/swim_record_new', function(req, res){

	db.serialize(function() {
	  //如果表格test01不存在，就新增test01
	  db.run("CREATE TABLE IF NOT EXISTS  record (owner_id INTEGER, item_id INTEGER, score INTEGER, unit_id INTEGER, authenticate_id INTEGER, year INTEGER, month INTEGER, date INTEGER)");
    	  //新增資料
	  var sql01 = "INSERT INTO record (owner_id, item_id, score, unit_id, authenticate_id) VALUES (?,?,?,?,?,?,?,?)";
	  db.run(sql01,[1, 0, 24, 0, 0]);  
  
  
	  //查詢資料
	  var sql02 = "SELECT rowid AS id, owner_id, item_id, score, unit_id, authenticate_id FROM record"; 
	  db.each(sql02, function(err, row) {
	  	  console.log(row.id + ":" + row.owner_id + ", " + row.item_id + "," + row.score + "," + row.unit_id + "," + row.authenticate_id);
	  });
	});
	var record_to_save = {owner_id: req.body.owner_id, item_id: 1, score:req.body.score, unit_id:0, authenticate_id: req.body.authenticate_id};
	table_records.push(record_to_save);
	res.redirect('/');
});


app.post('/login',
	
	
	function(req, res){
		api_sqlite.system_check_user(db, req, res, req.body.user, req.body.password);	
	//req.session.user = req.body.user;
	//res.redirect('/');
	}

//	res.redirect('/user/'+req.body.user);
/*	
		Passport.authenticate('local', {
			successRedirect: '/user',
			failureRedirect: '/'
			}
		);
		res.end();
*/	
/*
	Passport.authenticate('local', 
		
		{
		successRedirect: '/user', 
		failureRedirect: '/'		
		}
		
	)
*/	


//	Passport.authenticate('local')
);

//app.use(express.cookieParser());
app.use(Passport.initialize());
app.use(Passport.session());

app.use(busboy());
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');
format = function() {
    return util.format.apply(null, arguments);
};
app.use(express.static('public'));
app.use('/d3/',express.static('d3'));
app.use('/react/',express.static('d3'));
app.use('/markdown/',express.static('markdown'));
app.use('/UMLGen/',express.static('UMLGen'));
app.use('/test/',express.static('test'));
app.use('/blog',express.static('blog'));
app.use('/RepeatedCodeInverse',express.static('RepeatedCodeInverse'));
app.get('/users/:userID/books/:bookID',function(req, res){
	res.send(req.params)
})
var formidable = require('formidable');


app.use('/gallery', require('node-gallery')({
  staticFiles : 'blog/resources/photos',
  urlRoot : 'gallery', 
  title : 'Photo Gallery'
}));

app.get('/upload.html', function(req, response){

	fs.readFile('upload.html', function(error, data) {
     	   if (error){
		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
           } else {
		          response.writeHead(200, {"Content-Type": "text/html"});
		          response.write(data, "utf8");
       	   }
        response.end();
	});
});


app.get('/contest/vacation-photo', function(req, res){
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(), month: now.getmonth()
    });
});



app.get('/ui_cmd.html', function(request, response){

	fs.readFile('ui_cmd.html', function(error, data) {
     	   if (error){
		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
           } else {
		          response.writeHead(200, {"Content-Type": "text/html"});
		          response.write(data, "utf8");
       	   }
        response.end();
     });

});











server.listen(9092);
var servo_io = io.listen(server)

var Clients = [];
var path = require('path');
var root = path.dirname(require.main.filename)+'/';
var markdown_root = root+'blog/';
var current_path = markdown_root;
var last_path;
var path_stack=[];
//console.log(current_path);


servo_io.sockets.on('connection', function(socket) {
  Clients.push(socket);

  setInterval(function() {
    socket.emit('date', {'date': new Date()});
  }, 1000);

  socket.on('markdown', function(data){
	switch(data.type){
		case('cmd'):
			if(data.command == 'rm'){
				var filename = data.filename;
				try{
					fs.unlinkSync(current_path+filename);
					console.log('rm '+current_path+filename);
				}catch(err){
					console.log(err.message);
					socket.emit('server_response',{'response_content':err.message});
				}					
				break;
			}
			if(data.command == 'save'){
				/*
				if(data.publish){
					console.log('data published');
					fs.readFile('./sysconfig.json','utf8',function readFileCallBack(err, data){

						if(err){
							console.log(err);
						}else{
							console.log('start save');
							obj = JSON.parse(data);
							console.log('obj:'+obj);
							obj.publish = true;
							json = JSON.stringify(obj);
							fs.writeFile('sysconfig.json', json, 'utf8', callback);
						}

					});
				}
				*/

				if(data.publish){
					console.log('publish!');
					fs.readFile('./sysconfig.json','utf8',function readFileCallBack(err, sysdata){

						if(err){
							console.log(err);
						}else{
							console.log('start save');
							obj = JSON.parse(sysdata);
							console.log('obj:'+obj);
							console.log('filename:'+data.filename);
							obj[data.filename].publish = true;
							//obj.test = true;
							json = JSON.stringify(obj);
							fs.writeFile('sysconfig.json', json, 'utf8');
						}

					});
				}else{
					console.log('unpublish');
				}

				var tags = data.tag;
				console.log(tags);
				relative_pwd = current_path.slice(markdown_root.length);
				var public_html_content = "<!DOCTYPE html>";
				public_html_content += "<html>\n";
				public_html_content += "<head>\n";
    				public_html_content += "<script src='//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>\n"
				public_html_content += "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>\n"
				public_html_content += "</head>\n";
				public_html_content += "<body>\n";
				public_html_content += "<div class='container'>\n";
				public_html_content += "<div class='row'>\n";
				public_html_content += "<div class='col-lg-12 bg-warning'>\n";
				public_html_content += data.html_content;
				public_html_content += "</div>\n";
				public_html_content += "</div>\n";
				public_html_content += "</div>\n";
				public_html_content += "<script src='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js'></script>\n"
				public_html_content += "</body>\n";
				public_html_content += "</html>\n";
				console.log(data.html_content);	
				public_html_content = obj2html.gen_main_html(data.html_content);

				fs.writeFile('blog/'+ relative_pwd +data.filename+'.html', public_html_content, function(err){}	);
				fs.writeFile('blog/'+ relative_pwd +data.filename+'.markdown', data.markdown_content, function(err){}	);
				socket.emit('server_response',{'response_content':'blog/'+relative_pwd + data.filename+' .html/markdown has been created.'});
				socket.emit('markdown',{'command':'link',
							'link':'http://yushengc.twbbs.org:9090/blog/'+relative_pwd+data.filename+'.html'});				
				//fs.writeFile('blog/'+data.path+data.filename+'.markdown', data.markdown_content, function(err){});
				break;
			}
			if(data.command == 'mkdir'){
				//console.log('mkdir path:'+data.path);	
//				console.log('current_path:'+current_path.slice(root.length));
				var dir_to_create = current_path.slice(root.length)+data.path;
        		//fstream = fs.createWriteStream(__dirname + '/blog/resources/photos/' +relative_path + filename);
				
				var photo_dir_to_create = 'blog/resources/photos/'+ dir_to_create.slice(5)+'/';
				console.log('dir_to_create:'+dir_to_create);
				console.log('photo_dir_to_create:'+photo_dir_to_create);
				if(!fs.existsSync(dir_to_create)){
					fs.mkdirSync(dir_to_create);
					console.log(dir_to_create+' has been created.');
					socket.emit('server_response',{'response_content':dir_to_create+' has been created.'});
				}else{
					console.log('the directory is already existed.');
					socket.emit('server_response',{'response_content':'the directory is already existed.'});
				}
				
				if(!fs.existsSync(photo_dir_to_create)){
					fs.mkdirSync(photo_dir_to_create);
					console.log(photo_dir_to_create+' has been created.');
					socket.emit('server_response',{'response_content':photo_dir_to_create+' has been created.'});
				}else{
					console.log('the directory is already existed.');
					socket.emit('server_response',{'response_content':'the directory is already existed.'});
				}
				
				break;
			}
			
			if(data.command == 'edit'){
				console.log('filename:'+data.filename);
				console.log('current_path:'+current_path);
//				fs.readFile('blog/'+ relative_pwd +data.filename+'.markdown', data.markdown_content, function(err){}	);
				var relative_path = current_path.slice(root.length);
				console.log('path:'+relative_path+data.filename);
				//var tmp = fs.readFile(relative_path+data.filename, function(err){}	);
				fs.readFile(relative_path+data.filename, 'utf8', function (err, data){
					if(err){
						return console.log(err);
					}
					//console.log(data);
					socket.emit('markdown',{
						'command':'edit',
						'data':data	
					});
					console.log('data'+data);
				});
				break;
			}
			/*
			if(data.command == 'pwd'){				
				//var path = require('path');
				//var appDir = path.dirname(require.main.filename);
				console.log('current_path:'+current_path);
				console.log('markdown_root:'+markdown_root);
				console.log(current_path.slice(markdown_root.length));
				var residue_path = current_path.slice(markdown_root.length);
				if(residue_path){
					socket.emit('server_response',{'response_content':residue_path});
				}else{
					socket.emit('server_response',{'response_content':'/'});
				}
			}
			*/
			if(data.command == 'ls_photo'){
//				console.log('path: '+data.path);
//				var tmp = fs.
				var path = 'blog/';
				relative_pwd = current_path.slice(markdown_root.length);
        			var album_pwd = __dirname + '/blog/resources/photos/' +relative_pwd;
				console.log('album_pwd:'+album_pwd);
				if(data.path){
					path+= data.path;
				}
				try{
					var tmp = fs.readdirSync(album_pwd);
					//console.log('files:'+tmp);
					
					socket.emit('server_response',{
						'cmd':'ls_photo',
						'response_content':tmp,
						'path':'http://yushengc.twbbs.org:9090/blog/'+relative_pwd});				
					
				}catch(err){
					console.log(err);
					socket.emit('server_response',{'response_content':err});
				}
				break;
			}
			if(data.command == 'ls'){
//				console.log('path: '+data.path);
//				var tmp = fs.
				var path = 'blog/';
				relative_pwd = current_path.slice(markdown_root.length);
				if(data.path){
					path+= data.path;
				}
				try{
					var tmp = fs.readdirSync(current_path);
					console.log('ls:'+current_path);

					socket.emit('server_response',{
						'cmd':'ls',
						'response_content':tmp,
						'path':'http://yushengc.twbbs.org:9090/blog/'+relative_pwd});				
				}catch(err){
					console.log(err);
					socket.emit('server_response',{'response_content':err});
				}
				break;
			}
			if(data.command == 'cd'){
				//console.log('path: '+data.path);
				var dir = data.path;
				console.log('cd cmd dir to move:'+dir);
				if(dir=='..'){
					console.log('a');
					current_path = path_stack.pop();
					if(current_path){
						//console.log(path_stack);
						socket.emit('markdown',{
							'command':'dir',
							'dir':current_path.slice(markdown_root.length)
						});
						console.log('pwd:'+current_path);
					}else{
						current_path = markdown_root;
						socket.emit('server_response',{
							'response_content':'you are already in root directory'
						});
						
					}
					

				}else{
					var new_path = current_path + dir + '/';
					//console.log('current_path:'+current_path);
					if(!fs.existsSync(new_path)){						
						socket.emit('server_response',{'response_content':'directory not exist'});
					}else{
						//last_path = current_path;
						path_stack.push(current_path);
						console.log("paths in stack:"+path_stack);
						current_path = new_path;
						socket.emit('markdown',{
							'command':'dir',
							'dir':current_path.slice(markdown_root.length)
						});
						
					}
					console.log('pwd:'+current_path);
				}
				break;
			}
			socket.emit('server_response',{'response_content':'command not support'});
			break;
	}
  });

var authenticate = false;
  // 接收來自於瀏覽器的資料
  socket.on('client_data', function(data) {
    //process.stdout.write(data.letter);
    hp = hp + 1;
  });
  socket.on('jarvis', function(data){
	if(data.type == 'command'){
		console.log('command from jarvis:'+ data.command);		
		switch(data.command){
			case('ls'):
				var tmp = fs.readdirSync('share/');
				socket.emit('server_response',{'response_content':tmp});
				console.log(tmp);
				break;
		}
	}
  });

  socket.on('user_command',function(data){
	//process.stdout.write(data.command);
	process.stdout.write('\n');
	console.log('command from user:'+data.command);
	switch(data.command){
		case('apple'):
			socket.emit('server_response',{'response_content':'ball'});
			console.log("ball");
			message_content = "someone hit apple";		
			sendAll(message_content);
			break;
		case('ls'):
			var tmp = fs.readdirSync('.');
			socket.emit('server_response',{'response_content':tmp});
			console.log(tmp);
			break;
		case('mkdir'):
			var tmp = fs.mkdir('songla');
			socket.emit('server_response',{'response_content':tmp});
			console.log(tmp);
			break;
		case('ruby'):
			authenticate = true;
			socket.emit('server_authenticate',{'authenticate':authenticate});
			break;
		case('save'):
			
			break;
		case('edit'):
			fs.readFile('blog/index.html', 'utf8', function(err, contents) {
				if(contents){
    					//console.log(contents);
					socket.emit('server_response',{'response_content':contents});
				}else{
					console.log('file not exist');
				}
			});
			//socket.emit('server_response',{'response_content':contents});
			
			break;
			
		default: //nothing
			socket.emit('server_response',{'response_content':"the command is NOT support."});
	}
	//Leximal Analyzer
	var tokens = compiler.lexical(data.command);
	/*
	if(data.command=='apple'){
    		//socket.emit('server_response',{'response_content': hp});
		socket.emit('server_response',{'response_content':'ball'});
		console.log("ball");
		message_content = "someone hit apple";		
		sendAll(message_content);
	}
	*/
  
  });
});

function sendAll(message){
	for(var i=0; i<Clients.length;i++){
	//	Clients[i].send("Message"+message);
		Clients[i].emit('server_brd_message',{'message_content':message_content});
	}
}
