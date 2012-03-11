LightTag: Lag as a feature?

Getting started
===============

1) Install npm

2) clone LightTag, cd to that directory

3) Install a few packages into the LightTag directory `npm install express socket.io jade supervisor`

4) Run LightTag: "node_modules/.bin/supervisor app.js"

    Alternatively, to automatically refresh the page when code is changed:
        node_modules/.bin/supervisor --watch "js|jade" app.js
        append ?go=1&debug=1
    
Copyable:

    git clone https://pwaller@github.com/pwaller/LightTag.git
    cd LightTag
    npm install express socket.io jade supervisor
    node_modules/.bin/supervisor app.js
