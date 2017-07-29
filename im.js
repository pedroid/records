var im = require('imagemagick')
var filename = 'IMAG1506.jpg';
var file_path = __dirname + '/blog/resources/photos/' + filename;
var filename_small = filename.split('.')[0]+'_small.'+filename.split('.')[1];
var file_small_path = __dirname + '/blog/resources/photos/' + filename_small; 
console.log('file_path:'+file_path);
im.resize({
	  srcPath: file_path,
	  dstPath: file_small_path,
	  width:   256
	}, function(err, stdout, stderr){
	console.log(err + stdout + stderr);
})
