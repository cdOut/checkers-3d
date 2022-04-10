class Ui {
    constructor() {
        this.handleButtons();
        this.timerInterval = undefined;
    }
    handleButtons() {
        $('#checkers-info').on('DOMSubtreeModified', function() {
            $(window).trigger('resize');
        });

        $('#login').on('click', function() {
            if($('#username').val()) {
                net.sendData('ADD_USER', $("#username").val());
            } else {
                $('#checkers-info').html('<b>EMPTY_NAME</b><br>You cannot leave your username <span>empty</span>.');
            }
        });

        $('#reset').on('click', function() {
            net.sendData('RESET_USERS');
        });

        $('#checkers-btn').on('click', function() {
            $('#checkers-btn').css('display', 'none');
            $('#checkers-preview').css('display', 'initial');
        });
    }
    previewArray(array, color) {
        $('#preview-table').empty();
        for(let x = 0; x < 8; x++) {
            let context = '<tr>';
            for(let z = 7; z >= 0; z--)
                context += '<td>' + array[(color == 'aaaaaa' ? x : 7 - x)][(color == 'aaaaaa' ? z : 7 - z)] + '</td>';
            $('#preview-table').append(context + '</tr>');
        }
    }
    waitingScreen() {
        if(this.timerInterval != undefined)
            clearInterval(this.timerInterval);
        $('#checkers-cover').css('display', 'initial');
        $('#checkers-wait').css('display', 'initial');
        $('#checkers-wait').empty();
        $('#checkers-wait').append('<h1>Waiting for your opponent\'s move...</h1>');
        $('#checkers-wait').append('<h1 id="wait-timer">30</h1>');
        $('#wait-timer').css('margin-top', '15px');
        $('#wait-timer').css('font-size', '72px');

        this.timerInterval = setInterval(function() {
            let left = parseInt($('#wait-timer').text());
            if(left > 0) {
                left--;
            } else {
                clearInterval(this.timerInterval);
                $('#checkers-wait').empty();
                $('#checkers-wait').append('<h1>Your opponent didn\'t make a move, you win!</h1>');
            }
            $('#wait-timer').text(left);
        }, 1000);
    }
}