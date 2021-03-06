'use strict';
var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var simpleGit = require('simple-git');

var port = process.env.PORT || 9000;
var statusCode = process.env.STATUS_CODE || 200;
var remoteRepo = process.env.REMOTE_REPO;
var localRepo = __dirname + '/localRepo';

var rmdir = function(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = path.join(dir, list[i]);
        var stat = fs.statSync(filename);

        if(filename == '.' || filename == '..') { //pass these files
        } else if(stat.isDirectory()) { //rmdir recursively
            rmdir(filename);
        } else {
            fs.unlinkSync(filename); //rm filename
        }
    }
    fs.rmdirSync(dir);
};

fs.lstat(localRepo, function(err, stats) {
    if (!err && stats.isDirectory()) {
        rmdir(localRepo);
        console.log('Removing local repository: ' + localRepo);
    }
    simpleGit().outputHandler(function (command, stdout, stderr) {
                stderr.pipe(process.stderr);
                })
                .clone(remoteRepo, localRepo)
                .then(function() {
                    try {
                        var gitConfigFile = localRepo + '/.git/config';
                        fs.appendFileSync(gitConfigFile, '[user]\n');
                        fs.appendFileSync(gitConfigFile, 'name = ' + process.env.GIT_NAME + '\n');
                        fs.appendFileSync(gitConfigFile, 'email = ' + process.env.GIT_EMAIL + '\n');
                        fs.appendFileSync(gitConfigFile, '[push]\n');
                        fs.appendFileSync(gitConfigFile, 'default = simple\n');

                        console.log('Set git config file: ' + gitConfigFile);

                    } catch (err) {
                        console.log(err.toString());
                    }
                });
});

var server = http.createServer(requestListener);
server.listen(port);

function requestListener (request, response) {
    console.log('Incoming ' + request.method + ' request. Length: ' + request.headers['content-length'] + ', type: ' + request.headers['content-type']);
    if (request.method == 'POST') {
        console.log('POST request received');
        var body = '';
        console.log('body variable created');

        request.on('data', function (data) {
            console.log('Requesting data...');
            body += data;
            console.log('Saving data...'); // Heroku app often just stops here...

            if (body.length > 1e6) // For safety, destroy connection if POST data > ~1MB
                console.log('Connection too large, destroying...');
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = querystring.parse(body);
            console.log('Received post: ' + post.post_title);

            var date = post.post_date;
            var title = post.post_title;
            var type = post.post_type;
            var author = process.env.AUTHOR || 'Author Name';
            var content = post.post_content;

            var filePath = localRepo + '/_posts/';
            var filename = filePath + date.split(' ')[0] + '-' + title.replace(/\s+/g, '-').toLowerCase() + '.markdown';

        try {
            fs.writeFileSync(filename, '---\n');
            fs.appendFileSync(filename, 'title: "' + title + '"\n');
            fs.appendFileSync(filename, 'date: ' + date + '\n');
            fs.appendFileSync(filename, 'layout: ' + type + '\n');
            fs.appendFileSync(filename, 'author: "' + author + '"\n');
            fs.appendFileSync(filename, '---');
            fs.appendFileSync(filename, '\n');
            fs.appendFileSync(filename, content);

            console.log('Created new file: ' + filename);

            simpleGit(localRepo).outputHandler(function (command, stdout, stderr) {
                                    stdout.pipe(process.stdout);
                                    stderr.pipe(process.stderr);
                                 })
                                .add(filename)
                                .commit('Add post: ' + title)
                                .push(remoteRepo);

            } catch (err) {
                console.log(err.toString());
            }
        });
    }

  response.writeHead(statusCode, {'Content-Type': 'text/plain'});
  response.end();
}

console.log('Listening to port ' + port.toString());
console.log('Returning status code ' + statusCode.toString());