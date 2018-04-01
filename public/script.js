var playersRef = firebase.database().ref('players');
var matchesRef = firebase.database().ref('matches');

$(document).ready(function(){
    
    $('#playerList').html('')
    playersRef.orderByChild("totalPoints").on('child_added', snap => {
        var playerSummaryCard = $("#fragmentsContainer .playerSummaryCard").clone();
        populatePlayerRecord(playerSummaryCard, snap);
        $('#playerList').prepend(playerSummaryCard);
    });
    playersRef.on('child_changed', snap => {
        var playerSummaryCard = $('#playerList .playerSummaryCard[data-id="'+snap.key+'"]');
        populatePlayerRecord(playerSummaryCard, snap);
    });
    
    matchesRef.orderByChild("timestamp").on('child_added', snap => {
        var $row = $('<tr data-id="'+snap.key+'"><td class="timestamp"></td><td class="won"><i class="fa fa-cog fa-spin"/></td><td class="lost"><i class="fa fa-cog fa-spin"/></td></tr>');        
        populateMatchRecord($row, snap)

    });
    matchesRef.on('child_changed', snap=> {
        var $row = $('#matchList tbody tr[data-id="'+snap.key+'"]');
        populateMatchRecord($row, snap)
    });
})

function populatePlayerRecord($playerSummaryCard, snap) {
    $playerSummaryCard.attr('data-id', snap.key);
    $('.playerName',$playerSummaryCard).text(snap.child('name').val());
    $('.playerPoints',$playerSummaryCard).text(parseFloat(snap.child('totalPoints').val()).toFixed(2));
    $('tr.won td', $playerSummaryCard).text(snap.child('won').numChildren());
    $('tr.lost td', $playerSummaryCard).text(snap.child('lost').numChildren());
}

function populateMatchRecord($row, snap) {
    var timeNode = snap.child('timestamp');

    var currentMatchRef = matchesRef.child(snap.key);

    $('td.won, td.lost', $row).html('');
    currentMatchRef.child('lost').on('child_added', snap => {
        playersRef.child(snap.key+'/name').once('value', snapVal => {
            var name = snapVal.val();
            $('td.lost', $row).append('<button type="button" data-id="'+snap.key+'" class="userHighlight btn btn-outline-danger btn-sm mr-1"><i class="fa fa-check selectedMark"></i> '+name+'</button>')
        })
    });
    currentMatchRef.child('won').on('child_added', snap => {
        playersRef.child(snap.key+'/name').once('value', snapVal => {
            var name = snapVal.val();
            $('td.won', $row).append('<button type="button" data-id="'+snap.key+'" class="userHighlight btn btn-outline-success btn-sm mr-1"><i class="fa fa-check selectedMark"></i> '+name+'</button>')
        })
    });

    $(".timestamp", $row).html(timeNode.val());

    $('#matchList tbody').prepend($row);
}

/**
 * Listen for the bubble event since badges are dynamic
 */

 //Change the appearance of the selected user
$('#matchList').on('click', '.userHighlight', function(e){
    e.preventDefault();
    var $target = $(e.target);
    var targetUserId = $target.attr('data-id');
    if ($target.hasClass('selectedUser')){
        //deselect
        $('#matchList .won .userHighlight[data-id="'+targetUserId+'"]')
                .removeClass('btn-info selectedUser')
                .addClass('btn-outline-success');
        $('#matchList .lost .userHighlight[data-id="'+targetUserId+'"]')
                .removeClass('btn-info selectedUser')
                .addClass('btn-outline-danger');
    }
    else {
        //select
        $('#matchList .userHighlight[data-id="'+targetUserId+'"]')
                .removeClass('btn-success btn-danger')
                .addClass('btn-info selectedUser');
    }
});
//Highlight all other instances of the hovered user
$('#matchList').on('mouseenter', '.userHighlight', function(e){
    var targetUserId = $(e.target).attr('data-id');
    $('#matchList .won .btn-outline-success.userHighlight[data-id="'+targetUserId+'"]').removeClass('btn-outline-success').addClass('btn-success');
    $('#matchList .lost .btn-outline-danger.userHighlight[data-id="'+targetUserId+'"]').removeClass('btn-outline-danger').addClass('btn-danger');
});
//UN-highlight all other instances of the hovered user
$('#matchList').on('mouseleave', '.userHighlight', function(e){
    var targetUserId = $(e.target).attr('data-id');
    $('#matchList .won .btn-success.userHighlight[data-id="'+targetUserId+'"]').removeClass('btn-success').addClass('btn-outline-success');
    $('#matchList .lost .btn-danger.userHighlight[data-id="'+targetUserId+'"]').removeClass('btn-danger').addClass('btn-outline-danger');
});

/**
 * CREATE PLAYER MODAL
 */
$('#createPlayerModal #doCreatePlayer').on('click', function(){
    var playersRef = firebase.database().ref().child("players")
    var input = $("#createPlayerModal input");
    var newNode = playersRef.push();
    newNode.child("name").set(input.val());
    newNode.child("totalPoints").set(0);
    newNode.child("lastUpdated").set(new Date());

    $('#createPlayerModal').one('hidden.bs.modal',function(){
        input.val('');
    }).modal('hide');
})

/**
 * CREATE MATCH MODAL
 */

 /**
  * ADD an extra player
  */
$('#recordMatchModal #addPlayerToMatch').on('click', function(){
    var $tableBody = $('#recordMatchModal table tbody');
    var newRow = $('tr:last-child', $tableBody).clone();
    $tableBody.append(newRow);

    //toggle the winner for the new row row
    $('.btn-group-toggle .btn:not(.active)', newRow).click();
    $('.playerPicker', newRow).change();//trigger reload of pickers
});

/**
 * Ensure that no 2 pickers can have the same player selected (doesnt work on mobile)
 */
$('#recordMatchModal').on('change', '.playerPicker', function(e){
    var modal = $('#recordMatchModal');

    //first enable all options
    $('option', modal).show();

    //now loop over each 'option'... and disable the selected values in other options.
    var allSelectors = $('.playerPicker', modal);
    allSelectors.each(function(i, current){
        var currentSelect = $(current);
        var selectedUserId = $('option:selected', currentSelect).attr('val');

        allSelectors.not(currentSelect).each(function(i, other){
            var otherSelect = $(other);

            $('option[val="'+selectedUserId+'"]', otherSelect).hide();
        })
    });    
});

/**
 * Save button with basic validation
 */
$('#recordMatchModal #saveChanges').on('click', function(){
    var modal = $('#recordMatchModal');

    // This duplicate detection is mainly needed for mobile
    var duplicatePlayer = undefined;
    var selectedPlayers={}
    $('.playerPicker option:selected', modal).each(function(i,e){
        var playerID = $(e).attr('val');
        if (selectedPlayers[playerID] == undefined) {
            selectedPlayers[playerID] = playerID;
        }
        else {
            duplicatePlayer = $(e).val();
        }
    });
    if (duplicatePlayer != undefined) {
        alert(duplicatePlayer + ' has been selected multiple times. Please choose another player.');
        return;
    }
    
    if ($('.playerPicker', modal).length < 2){
        alert('Please ensure there are atleast 2 players');
        return;
    }

    $('.playerPicker option:selected', modal).each(function(i,e){
        var opt = $(e);
        if (opt.val()==""){
            opt.closest("tr").remove();
        }
    });

    if ($('tr .btn-outline-success.active', modal).length==0) {
        alert('please choose atleat 1 winner');
        return;
    }
    if ($('tr .btn-outline-danger.active', modal).length==0) {
        alert('please choose atleat 1 looser');
        return;
    }

    //create new match...
    var newMatch = firebase.database().ref().child('matches').push();

    //calculate points
    // If there are more winners then losers - then less then 1 point is distributed
    // If there are more losers then winners - then more then 1 point is distributed
    var numberOfWinners = $("#recordMatchModal .btn-outline-success.active").length;
    var numberOfLoosers = $("#recordMatchModal .btn-outline-danger.active").length;
    var pointsPerWinner = (1/numberOfWinners) * numberOfLoosers; 

    //bulk insert the match data
    var updates = {};
    var matchTime = new Date();
    $('tbody tr', modal).each(function(i,r){
        var row = $(r)
        var selectedUserId = $('option:selected', row).attr('val');
        var isWinner = $('.btn-outline-success.active', row).length>0;
        var wonOrLost=isWinner ? 'won':'lost';
        var matchPoints=isWinner ? pointsPerWinner : 0;

        updates['/players/'+selectedUserId+'/'+wonOrLost+'/'+newMatch.key] = matchPoints;
        updates['/players/'+selectedUserId+'/lastUpdated/'] = matchTime;
        updates['/matches/'+newMatch.key+'/'+wonOrLost+'/'+selectedUserId] = matchPoints;

        if (isWinner)
        {
            playersRef.child(selectedUserId).once('value', snap => {
                var currentPoints = parseFloat(snap.child('totalPoints').val());
                updates['/players/'+selectedUserId+'/totalPoints'] = currentPoints + matchPoints;
            });
        }
    })
    updates['/matches/'+newMatch.key+'/timestamp'] = matchTime;

    firebase.database().ref().update(updates)

    modal.modal('hide');
});

/**
 * init the modal each time it is shown
 */
$('#recordMatchModal').on('show.bs.modal', function(){
    var playersRef = firebase.database().ref().child("players")

    $('#recordMatchModal .modal-body tbody').html('')
    var row = $('<tr>');
    var select = $('<select>').addClass('custom-select playerPicker');
    select.append($('<option>'));
    var winnerLooser = $('<div class="btn-group btn-group-toggle" data-toggle="buttons">\
        <label class="btn btn-outline-success active">\
        <input type="radio" name="options" id="option1" autocomplete="off" checked> Winner\
        </label>\
        <label class="btn btn-outline-danger">\
        <input type="radio" name="options" id="option2" autocomplete="off"> Looser\
        </label>\
    </div>');

    row.append($('<td>').append(select));
    row.append($('<td>').append(winnerLooser));
    row.append($('<td>').append($('<button id="removeMatchPlayer" class="btn btn-outline-danger">&times;</button>')));
    $('#recordMatchModal .modal-body tbody').append(row)

    playersRef.on('child_added', snap => {
        var nameNode = snap.child('name')
        
        var opt = $('<option>').html(nameNode.val());
        opt.attr('val', snap.key);

        $('#recordMatchModal .playerPicker').each(function(i,e){
            $(e).append(opt.clone())
        });
    });
});

/**
 * Listen for the bubble event since the remove button is dynamic
 */
$('#recordMatchModal').on('click', '#removeMatchPlayer', function(e){
    var row = $(e.target).closest('tr');
    if (row.siblings().length > 0) {
        row.remove()
        $('#recordMatchModal .playerPicker:first').change();//trigger reload of pickers
    }
});