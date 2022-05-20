class Sign {
	constructor(category, type, imgName, skDesc){
		this.category = category;
		this.type = type;
		this.imgName = imgName;
		this.skDesc = skDesc;
	}
}

let arrayOfSigns = new Array();
var currentJ = [], currentI = [];
var i, j, k, index = 0;
var timeGameFinished;
var finalScore;
var startTime;
var visibleAnswer = true;
var currentRound = 0;
var currentScore = 0;
var undoActions = 0;
var storedData;
var isLoading = false;
$('#posfinished').fadeOut(0);

$.ajax({
	type: 'GET',
	url: 'znacky.xml',
	dataType: 'xml',
	success: function(xml){
		$(xml).find('znacka').each(function(){
			var category = $(this).find('kategoria').find('skratka').text();
			var type = $(this).find('kategoria').find('vyklad').text();
			var imgName = $(this).find('img').text();
			var skDesc = $(this).find('text').find('sk').text();
			arrayOfSigns.push(new Sign(category, type, imgName, skDesc));
			});
		}
});

//50% to generate correct img+description combination
function generateGame(){
	for (i = 0; i <= 9; i++){
		currentJ[i] = Math.floor((Math.random() * (arrayOfSigns.length)));
		var test = Math.floor((Math.random() * 2));							
		if(test == 0){
			currentI[i] = Math.floor((Math.random() * (arrayOfSigns.length)));
		} else {
			currentI[i] = currentJ[i];
		}
	}
}

function nextTurn(index){
	j = currentJ[index];
	i = currentI[index];
	$('#posfinished').fadeIn(0);
	$('#output').empty();
	$('#output').append('<div class="text-center onetry" id="'+i+'"><p class="text-center">'+ arrayOfSigns[i].category +' - '+ arrayOfSigns[i].type +'<br>'+arrayOfSigns[i].skDesc+'</p><img id="'+i+'" class="draggable" src="img/'+arrayOfSigns[j].imgName+'"></div>').hide().fadeIn(250);
	$('#turn').html((index)+'/10 kolo');
	if ((undoActions < 3) && (currentRound > 0)){
		$('#buttback').prop('disabled', false);
	} else {
		$('#buttback').prop('disabled', true);
	}
	if(visibleAnswer) {
		visibleAnswer = false;
		$('.answer').css('opacity', function(i, o){
			return parseFloat(o).toFixed(1) === '0' ? 0 : 1;
		});
	}
	saveLocal()
	$('.draggable').draggable({
		revert: true,
		containment: '#gameWindow',
		zIndex: 10
	});
	$('.answer').droppable({
		drop: checkAnswer 
	});
}

//Drag'n'drop------------------------------------------------------------------
function checkAnswer(event, ui){
	var textID = ui.draggable.attr('id');
	var answer = $(this).attr('id');

	if(answer == 'nespravne'){
		if(textID == j){
			currentScore -= 0.5;
		} else {
			currentScore++;
		}
	} else {
		if(textID != j){
			currentScore -= 0.5;
		} else {
			currentScore++;
		}
	}
	$('#finished').append('<img src="img/'+arrayOfSigns[j].imgName+'" draggable="false">');								//TODO <table>	//TODO <span>"'+vyklad[textID]+'"</span> 
	$('.Score').text('Skóre: ' + currentScore);
	
	currentRound++;
	if(currentRound == 10) {
		$('#turn').fadeOut(250);
		$('#output').fadeOut(250);
		$('.Timer').fadeOut(250);
		$('.Score').fadeOut(250);
		$('#posfinished').fadeOut(250);
		
		timeGameFinished = Math.round((new Date - startTime) / 1000, -1);
		timeGameFinished = Math.ceil(timeGameFinished);
		clearInterval(timer);
		visibleAnswer = true;
		$('.answer').css('opacity', function(i,o){
			return parseFloat(o).toFixed(1) === '1' ? 1 : 0;
		});
		finalScore = (currentScore - (timeGameFinished*0.05)).toFixed(1);
		if(checkHighscore(finalScore)){
			$('#board').empty();
			$('#board').append(finalScore);
		}
		saveLocal();
		$('#Endgame').text('Koniec hry, tvoje skóre je ' + finalScore + 'b!');
	} else {
		index++;
		nextTurn(index);
	}
}
//=============================================================================

startTime = new Date;
var timer = setInterval(function() {$('.Timer').text('Uplynutý čas: ' + Math.round((new Date - startTime) / 1000, 0) + 's');}, 1000);
clearInterval(timer);

//Highscore--------------------------------------------------------------------
function checkHighscore(currentscore){
	var a = parseInt(currentscore, 10);
	var b = parseInt($('#board').html(), 10);
	if(a >= b){
		return 1;
	} else {
		return 0;
	}
}
//=============================================================================

//Štart hry--------------------------------------------------------------------
function newGame(){
	generateGame();
	resetGame();
}
//=============================================================================

//Reset hry--------------------------------------------------------------------
function resetGame(){
	$('#Endgame').empty();
	$('.Timer').text('Uplynutý čas: 0s').fadeIn(0);
	$('.Score').text('Skóre: 0').fadeIn(0);
	$('#turn').fadeIn(0);
	
	$('#finished').empty();
	//if(!isLoading){
		currentRound = currentScore = index = finalScore = timeGameFinished = undoActions = 0;
	//}
	$('#menu').empty();
	$('#menu').append('<li id="butt" class="list-group-item list-group-item-action bg-transparent" onclick="newGame()">Nová hra</li>');
	$('#menu').append('<li id="buttreset" class="list-group-item list-group-item-action bg-transparent" onclick="resetGame()">Opakovať hru</li><br>');
	$('#menu').append('<li id="buttsave" class="list-group-item list-group-item-action bg-transparent" onclick="saveSession()">Uložiť hru</li>');
	$('#menu').append('<li id="buttload" class="list-group-item list-group-item-action bg-transparent" onclick="loadSession()">Načítať hru</li><br>');
	$('#menu').append('<li id="buttquit" class="list-group-item list-group-item-action bg-transparent" onclick="location.href=\'https://wahwic.github.io\'">Ukončiť hru</li>');
	$('#menu').append('<li><button id="buttback" type="button" class="btn btn-outline-dark" onclick="goback()" disabled>&#60;== Vrátiť ťah</button></li>');
	if(timer != null) {
		clearInterval(timer);
	}
	startTime = new Date;
	timer = setInterval(function() {$('.Timer').text('Uplynutý čas: ' + Math.round((new Date - startTime) / 1000, 0) + 's');}, 1000);
	nextTurn(index);
}
//=============================================================================

//Vrátenie kroku hry-----------------------------------------------------------
function goBack(){
	if(currentRound == 10){
		$('#Endgame').empty();
		$('.Timer').text('Uplynutý čas: 0s').fadeIn(0);
		$('.Score').text('Skóre: 0').fadeIn(0);
		$('#turn').fadeIn(0);
	}
	currentRound--;
	currentScore -= 0.5;
	$('.Score').text('Skóre: ' + currentScore);
	undoActions++;
	$('#finished').children().last().remove();
	nextTurn(--index);
}
//=============================================================================

//Storage----------------------------------------------------------------------
function saveSession(){
	if(currentRound < 10){
		sessionStorage.setItem('currentgame_J_key',  JSON.stringify(currentJ));
		sessionStorage.setItem('currentgame_I_key',  JSON.stringify(currentI));
		sessionStorage['gamecount_key'] = currentRound;
		sessionStorage['index_key'] = index;
		sessionStorage['score_key'] = currentScore;
		sessionStorage['back_key'] = undoActions;
		sessionStorage['finalscore_key'] = $('#board').html();
	} else {
		alert('Nemôžeš uložiť hotovú hru.');
	}
}

function saveLocal(){
	localStorage.setItem('currentgame_J_key',  JSON.stringify(currentJ));
	localStorage.setItem('currentgame_I_key',  JSON.stringify(currentI));
	localStorage['gamecount_key'] = currentRound;
	localStorage['index_key'] = index;
	localStorage['score_key'] = currentScore;
	localStorage['back_key'] = undoActions;
	localStorage['finalscore_key'] = $('#board').html();
}

function loadSession(){
	if (sessionStorage.length > 0) {
		isLoading = true;
		currentRound = sessionStorage['gamecount_key'];
		index = sessionStorage['index_key']; 
		currentScore = sessionStorage['score_key'];
		undoActions = sessionStorage['back_key'];
		$('#board').html(sessionStorage['finalscore_key']);
		
		currentJ = JSON.parse(sessionStorage.getItem('currentgame_J_key'));
		currentI = JSON.parse(sessionStorage.getItem('currentgame_I_key'));
		
		resetGame();
		$('.Score').text('Skóre: ' + currentScore);
		$('.Timer').text('Uplynutý čas: ' + Math.round((new Date - startTime) / 1000, 0) + 's');
		
		for(k = 0; k <= index-1; k++){
			$('#finished').append('<img src="img/'+pic[currentJ[k]]+'" draggable="false">');		//TODO <table>
		}
		isLoading = false;
	} else {
		alert('Žiadna hra nieje uložená.');
	}
}

function clearStorage(){
	localStorage.clear();
	window.location.replace('index.html');
	window.location.replace('index.html');
}
//=============================================================================
$(document).ready(function() {
	if (localStorage.length > 0){
		if (localStorage.gamecount_key < 10) {
			isLoading = true;
			currentRound = localStorage['gamecount_key'];
			index = localStorage['index_key']; 
			currentScore = localStorage['score_key'];
			undoActions = localStorage['back_key'];
			$('#board').html(localStorage['finalscore_key']);
			
			currentJ = JSON.parse(localStorage.getItem('currentgame_J_key'));
			currentI = JSON.parse(localStorage.getItem('currentgame_I_key'));
			
			resetGame();
			$('.Score').text('Skóre: ' + currentScore);
			$('.Timer').text('Uplynutý čas: ' + Math.round((new Date - startTime) / 1000, 0) + 's');
		
			for(k = 0; k <= index-1; k++){
				$('#finished').append('<img src="img/'+arrayOfSigns[currentJ[k]].imgName+'" draggable="false">');		//TODO <table> or <div>
			}
			isLoading = false;
		} else {
			$('#board').html(localStorage['finalscore_key']);
		}
	}
});