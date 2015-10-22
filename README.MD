Need something to listen to webhooks sent by Wordpress plugin HookPress. Then creates a new post.md based on the data from the webhook. This new post will automatically be commited to a git repository.

Configuration:
- REMOTE_REPO: HTTP(S) path to remote repository which contains the Jekyll blog. Authentication via password/tokens can be set in the path. eg. 'https://username:averylongtokengeneratedbygithub@github.com/username/a-jekyll-blog.git'
- AUTHOR: Sets the author's name in the generated post.md

Optional Configurations:
- PORT: Where the HTTP server listens
- STATUS_CODE: HTTP status code sent back by the server after receiving the webhook


Based on:
- http://blog.kyletolle.com/using-node-js-to-inspect-webhook-calls/
- http://stackoverflow.com/questions/4295782/how-do-you-extract-post-data-in-node-js

Alternative:
- https://github.com/kyletolle/polis.js

Helped by:
- rmdir: https://gist.github.com/tkihira/2367067
- rmdir alternative: https://github.com/isaacs/rimraf
- rmdir alternative: http://www.geedew.com/remove-a-directory-that-is-not-empty-in-nodejs/
- http://stackoverflow.com/questions/4482686/check-synchronously-if-file-directory-exists-in-node-js

Todo:
- Restrict webhook sender IP
- Select branch to deploy to