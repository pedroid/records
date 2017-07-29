var im = require('imagemagick')
var busboy = require('connect-busboy')
var express = require('express')
var http = require('http')
var url = require('url')
var fs = require('fs')
var io = require('socket.io')
var compiler = require('./compiler.js')
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
	cookie:{
		maxAge:30*1000
	},
	resave:true,
	saveUninitialized: true
}));

app.use( Passport.initialize() );
app.get('/logout', function(req, res){
	req.logOut();
	req.session.destroy(function(err){
		res.redirect("/login.html");
	});
//	res.redirect("/login.html");
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

app.get('/login.html', function(req, response, next) {

	fs.readFile('login.html', function(error, data) {
     	   if (error){
		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
           } else {
		          response.writeHead(200, {"Content-Type": "text/html"})
		          response.write(data, "utf8");
       	   }
        response.end();

	});
});
app.get('/user',
	function(req, res){
		//req.session.user = user.user;
		console.log('user:'+req.session.user);
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
		//res.send("hi "+ req.session.user  +",这是你第"+req.session.count+"来访");
		res.render(
			'index.ejs',
			{quotes: req.session.user});

		}else{//first
			
		//req.session.user = "kiro";
		console.log(req.session.user);
		req.session.count = 1;	//第几次访问
		req.session.isvisit = true;
		//res.send('hi '+ req.session.user +',first time');
		res.render(
			'index.ejs',
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

app.post('/login', 
	
	function(req, res){
	//	console.log(req.body);
	//	console.log(req.body.user);
	req.session.user = req.body.user;
	res.redirect('/user/');
//	res.redirect('/user/'+req.body.user);
	/*
		Passport.authenticate('local', {
			successRedirect: '/user',
			failureRedirect: '/'
			}
		);
		//res.end();
	*/
	}
	
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


app.get('/blog/:article/:assets',function(req, response){
//	console.log('blog/'+req.params['article']+'/'+req.params['assets']);
	

	//response.send(req.params);
	console.log('blog/'+req.params['article']+'/'+req.params['assets']);
	
	fs.readFile('blog/'+req.params['article']+'/'+req.params['assets'], function(error, data){

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
app.get('/blog/:article',function(req, response){
//	console.log('test');
	//res.send(req.params);
	if(req.params['assets']=='woodwork'){
		console.log('woodwork page');
	}else{
		console.log('assets:'+req.params['assets']);
	}
	fs.readFile('blog/'+req.params['article'], function(error, data){
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
app.get('/', function(req, res){
//	res.send('Hello World!');
	fs.readFile('index.html', function(error, data){
     	   	if (error){
		          res.writeHead(404,{'Content-Type':'text/html'});
	        	  res.write("opps this doesn't exist - 404");
	        } else {
		          res.writeHead(200, {"Content-Type": "text/html"});
		          res.write(data, "utf8");
       		}
		res.end();
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

app.get('/youtube.html', function(request, response){
	fs.readFile('youtube.html', function(error, data){
		if(error){

		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
		}else{
		          response.writeHead(200, {"Content-Type": "text/html"});
		          response.write(data, "utf8");

		}
		response.end();
	});
});

app.get('/markdown/markdown.html', function(request, response){
	fs.readFile('markdown/markdown.html', function(error, data){
		if(error){

		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
		}else{
		          response.writeHead(200, {"Content-Type": "text/html"});
		          response.write(data, "utf8");

		}
		response.end();
	});
});

app.get('/form/test.html', function(request, response){
	fs.readFile('form/test.html', function(error, data){
		if(error){

		          response.writeHead(404,{'Content-Type':'text/html'});
	        	  response.write("opps this doesn't exist - 404");
		}else{
		          response.writeHead(200, {"Content-Type": "text/html"});
		          response.write(data, "utf8");

		}
		response.end();
	});
});

app.get('/form/get.html', function(request, response){
	fs.readFile('form/get.html', function(error, data) {
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

app.get('/form/post.html', function(request, response){
	fs.readFile('form/post.html', function(error, data) {
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

app.get('/form/signup_get', function(request, response){
//	res.send('Hello World!');
	response.writeHead(200, {"Content-Type":"text/html"});
	var path=url.parse(request.url),
		parameter=qs.parse(path.query);
		console.log(parameter);
		response.end();

});

app.get('/songla.html',function(req, res){
	relative_path = current_path.slice(root.length);
	relative_path = relative_path.slice(5);
	fs.readFile(relative_path+'test.data', 'utf8', function (err, data){
		if(err){
			return console.log(err);
		}
		res.render(
			'blog.ejs', 	
			{blog_content: "<h1>test</h1>"}
		);
	});
});
app.get('/forfun.html',function(req, res){
	res.render(
		'index.ejs', 
		{quotes: 111}
	);
});


app.post('/UMLGen/fsm_post', function(request, response){
	var state_grp = [];
	formData='';
//	console.log(request.body.state0);
	

		state_grp = [];
		
		response.writeHead(200, {"Content-Type":"text/html"});
		state_number = request.body.state_number;
		response.write("state number="+state_number+"<br/>");
//		state0 = post.state0;
//		state1 = post.state1;
		for(var i =0; i<state_number;i++){
			eval('state_grp.push(request.body.state'+i+');');
		}
		for(var i=0;i<state_number;i++){
			response.write("state"+i+"="+state_grp[i]+'<br/>');
		}
		console.log(state_grp);
		design_pattern.fsm(state_grp);
//		response.write("state0="+state0+"<br/>");
//		response.write("state1="+state1+"<br/>");
		
	response.end();
});

app.post('/form/forfun', function(request, response){
	console.log('form/forfun');
	formData='';
	request.on("data", function(data){
		//var post = qs.parse(data);
		formData+= data;
		//console.log(post);
//		return formData+= data;
		console.log('data:'+data);
	});
	request.on("end", function(){
		response.writeHead(200, {"Content-Type":"text/html"});
		post = qs.parse(formData);
		state = post.state;
		state2 = post.state2;
		response.write("state="+state+"<br/>");
		response.write("state2="+state2+"<br/>");
		response.end();
	});

});

server.listen(9090)
var servo_io = io.listen(server)

var Clients = [];
var path = require('path');
var root = path.dirname(require.main.filename)+'/';
var markdown_root = root+'blog/';
var current_path = markdown_root;
var last_path;
var path_stack=[];
//console.log(current_path);

app.post('/file_upload', function(req, res){
		var fstream;
		req.pipe(req.busboy);
		var curr_file;
//		console.log('forfun:'+req.busboy.name);
		req.busboy.on('field', function(fieldname, val, fieldTruncated, valTruncated, encoding, mimetype){
			//console.log(fieldname + ':' + val);
	/*		console.log("fieldname:" + fieldname);
			console.log("val:"+val);
			console.log("fieldTruncated:"+fieldTruncated);
			console.log("valTruncated:"+valTruncated);
			console.log("encoding:"+encoding);
			console.log("mimetype:"+mimetype);

	*/
		});
		req.busboy.on('file', function(fieldname, file, filename){			
			curr_file = filename;
			relative_path = current_path.slice(root.length);
			relative_path = relative_path.slice(5);
			console.log('relative_path:'+relative_path);
			//console.log("Uploading:: " + filename); 
			var file_path = __dirname + '/blog/resources/photos/' + relative_path + filename;
			var filename_small = filename.split('.')[0]+'.small.'+filename.split('.')[1];
			var file_small_path = __dirname + '/blog/resources/photos/' + relative_path + filename_small; 
//      		fstream = fs.createWriteStream(__dirname + '/blog/resources/photos/' +relative_path + filename);
	      		fstream = fs.createWriteStream(file_path);
        		file.pipe(fstream);
        		fstream.on('close', function () {
            		res.redirect('back');
			});
			console.log('file_path:'+file_path);
			console.log('file_small_path:' + file_small_path);
		});
		req.busboy.on('finish', function(req, res){
			console.log('end upload');
			relative_path = current_path.slice(root.length);
			relative_path = relative_path.slice(5);
			var file_path = __dirname + '/blog/resources/photos/' + relative_path + curr_file;
			var filename_small = curr_file.split('.')[0]+'.small.'+curr_file.split('.')[1];
			var file_small_path = __dirname + '/blog/resources/photos/' + relative_path + filename_small; 
			var filename = curr_file.split('.')[1];	
			im.resize({
				  srcPath: file_path,
				  dstPath: file_small_path,
				  width:   600
				}, function(err, stdout, stderr){
			//	console.log(err + stdout + stderr);
				console.log('resized image generated');
			})
		});

});

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
