const http = require('http');
const qs = require("querystring");
const fs = require('fs');

let players = [];
let pieces = [];
let turn = 0;

const defaultPieces = function() {
    pieces = [];
    for(let z = 0; z < 8; z++) {
        pieces[z] = [];
        for(let x = 0; x < 8; x++) {
            pieces[z][x] = 0;
        }
    }
    for(let i = 0; i < 8; i++) {
        pieces[i % 2 == 0 ? 6 : 7][i] = 1;
        pieces[i % 2 == 0 ? 0 : 1][i] = 2;
    }
}

defaultPieces();

const server = http.createServer(function(req, res) {
    switch(req.method) {
        case 'GET':
            req.url = decodeURIComponent(req.url);
            if (req.url == '/') {
                fs.readFile('static/index.html', (err, data) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                });
            } else {
                fs.readFile("static" + req.url, function (error, data) {
                    if (!error) {
                        let type = 'text/plain';
                        let end = req.url.split('.').pop();
                        switch (end) {
                            case 'html': type = 'text/html'; break;
                            case 'css': type = 'text/css'; break;
                            case 'js': type = 'application/javascript'; break;
                            case 'png': type = 'image/png'; break;
                            case 'jpg': type = 'image/jpeg'; break;
                            case 'mp3': type = 'audio/mpeg'; break;
                        }
                        res.writeHead(200, { 'Content-Type': type });
                        res.write(data);
                        res.end();
                    }
                });
            }
            break;
        case 'POST':
            let content = { action: 'ACTION_ERROR' };
            let allData = '';
            req.on('data', function (data) {
                allData += data;
            });

            req.on('end', function() {
                let endData = qs.parse(allData);
                switch(endData.action) {
                    case 'ADD_USER':
                        if(players.length >= 2) {
                            content.action = 'LOBBY_FULL';
                            content.name = endData.data;
                            break;
                        } else if(players.includes(endData.data)) {
                            content.action = 'USER_EXISTS';
                            content.name = endData.data;
                            break;
                        } else {
                            content.action = 'USER_ADDED';
                            content.name = endData.data;
                            content.side = !players.length ? 'white' : 'black';
                            players.push(endData.data);
                            content.players = players;
                            content.pieces = pieces;
                            break;
                        }
                    case 'GET_USERS':
                        content.action = 'RETURN_USERS';
                        content.players = players;
                        break;
                    case 'RESET_USERS':
                        content.action = 'USERS_CLEARED';
                        defaultPieces();
                        players = [];
                        turn = 0;
                        break;
                    case 'END_TURN':
                        content.action = 'END_TURN';
                        pieces = JSON.parse(endData.data);
                        turn = (turn == 0 ? 1 : 0);
                        break;
                    case 'CHECK_TURN':
                        content.action = 'CHECK_TURN';
                        content.turn = turn;
                        content.pieces = JSON.stringify(pieces);
                        break;
                }
                res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
                res.write(JSON.stringify(content, null, 4));
                res.end();
            });
            break;
    }
});

server.listen(3000, function() {
    console.log('Serwer startuje na porcie 3000');
});