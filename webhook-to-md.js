var http = require('http');
var querystring = require('querystring');
var fs = require('fs');

var port = process.env.PORT || 9000;
var statusCode = process.env.STATUS_CODE || 200;

var server = http.createServer(requestListener);
server.listen(port);

function requestListener (request, response) {
    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            if (body.length > 1e6) // For safety, destroy connection if POST data > ~1MB
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = querystring.parse(body);

            var date = post['post_date'];
            var title = post['post_title'];
            var type = post['post_type'];
            var author = process.env.AUTHOR || 'Author Name';
            var content = post['post_content'];

            var filename = date.split(' ')[0] + '-' + title.replace(/\s+/g, '-').toLowerCase() + '.markdown';
            fs.writeFileSync(filename, '---\n');
            fs.appendFileSync(filename, 'title: "' + title + '"\n');
            fs.appendFileSync(filename, 'date: ' + date + '\n');
            fs.appendFileSync(filename, 'layout: ' + type + '\n');
            fs.appendFileSync(filename, 'author: "' + author + '"\n');
            fs.appendFileSync(filename, '---');
            fs.appendFileSync(filename, '\n');
            fs.appendFileSync(filename, content);
        });
    }

  response.writeHead(statusCode, {'Content-Type': 'text/plain'});
  response.end();
}

console.log("Listening to port " + port.toString());
console.log("Returning status code " + statusCode.toString());