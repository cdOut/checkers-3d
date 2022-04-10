class Net {
    constructor() {
        this.checkInterval = undefined;
    }
    sendData(action, data) {
        $.ajax({
            context: this,
            url: '/',
            type: 'POST',
            data: { action: action, data: data },
            success: function (response) {
                response = JSON.parse(response);
                switch(response.action) {
                    case 'LOBBY_FULL':
                        $('#checkers-info').html('<b>LOBBY_FULL</b><br>Hello <span>' + response.name + '</span>, the lobby is already full.');
                        break;
                    case 'USER_EXISTS':
                        $('#checkers-info').html('<b>USER_EXISTS</b><br>Player <span>' + response.name + '</span> already exists, choose another name.');
                        break;
                    case 'USER_ADDED':
                        $('#checkers-info').html('<b>USER_ADDED</b><br>Hello <span>' + response.name + '</span>, you play as ' + response.side + '.');
                        $('#checkers-login').css('display', 'none');
                        if(response.players.length > 1) {
                            $('#checkers-info').append(' Your opponent is <span>' + response.players[0] + '</span>, who plays as white.');
                            ui.waitingScreen();
                            this.checkInterval = setInterval(function() { this.sendData('CHECK_TURN'); }.bind(this), 500);
                        } else {
                            $('#checkers-wait').css('display', 'initial');
                            this.checkInterval = setInterval(function() { this.sendData('GET_USERS'); }.bind(this), 500);
                        }
                        game.color = (response.side == 'white' ? 'aaaaaa' : '222222');
                        game.pieces = response.pieces;
                        game.adjustCamera(response.side);
                        game.displayPieces();
                        break;
                    case 'RETURN_USERS':
                        if(response.players.length > 1) {
                            $('#checkers-cover').css('display', 'none');
                            $('#checkers-wait').css('display', 'none');
                            $('#checkers-info').append(' Your opponent is <span>' + response.players[1] + '</span>, who plays as black.');
                            clearInterval(this.checkInterval);
                            game.paused = false;
                        }
                        break;
                    case 'USERS_CLEARED':
                        $('#checkers-info').html('<b>USERS_CLEARED</b>');
                        break;
                    case 'END_TURN':
                        game.paused = true;
                        this.checkInterval = setInterval(function() { this.sendData('CHECK_TURN'); }.bind(this), 500);
                        ui.waitingScreen();
                        break;
                    case 'CHECK_TURN':
                        if(game.color == (response.turn == 0 ? 'aaaaaa' : '222222')) {
                            clearInterval(this.checkInterval);
                            game.paused = false;
                            game.pieces = JSON.parse(response.pieces);
                            ui.previewArray(game.pieces, game.color);
                            game.displayPieces();
                            $('#checkers-cover').css('display', 'none');
                            $('#checkers-wait').css('display', 'none');
                        }
                        break;
                }
            }
        });
    }
}