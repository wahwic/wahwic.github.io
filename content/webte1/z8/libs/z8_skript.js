var skratka = [], vyklad = [], pic = [], sk = [], en = [], currentJ = [], currentI = [];	//obsahujú xml dáta
var i, j, k, index;																			//pomocné
var timedone;																				//konečný čas dokončenia jednej hry
var finalscore;																				//konečné skóre jednej hry
var start;																					//čas začiatku jednej hry
var visibleanswer = true;																	//pomocná pre kontrolu viditeľnosti polí pre potiahnutie
var gamecount = 0;																			//aktuálne hrané kolo
var score = 0;																				//skóre pre danú hru
var back = 0;																				//počet použítých Undo
var storedData;																				//pomocná pre localstorage
var amloading = false;																		//aby sa nezresetovali premenné na nulu pri loadovaní
$("#posfinished").fadeOut(0);

//Prečítanie xml súboru--------------------------------------------------------
$.ajax({
	type: "GET",
	url: "znacky.xml",
	dataType: "xml",
	success: function(xml){
		var a = 0;
		$(xml).find('znacka').each(function(){
			skratka[a] = $(this).find('kategoria').find('skratka').text();
			vyklad[a] = $(this).find('kategoria').find('vyklad').text();
			pic[a] = $(this).find('img').text();
			sk[a] = $(this).find('text').find('sk').text();
			en[a] = $(this).find('text').find('en').text();
			a++;
			});
		}
});
//=============================================================================

//50% šanca na vygenerovanie správnej kombinácie
function generateGame(){
	for (i = 0; i <= 9; i++){
		currentJ[i] = Math.floor((Math.random() * (pic.length)));
		var test = Math.floor((Math.random() * 2));							
		if(test == 0){
			currentI[i] = Math.floor((Math.random() * (pic.length)));
		} else {
			currentI[i] = currentJ[i];
		}
	}
}

//Jedno kolo hry---------------------------------------------------------------
function nextTurn(index){
	j = currentJ[index];
	i = currentI[index];
	$("#posfinished").fadeIn(0);
	$("#output").empty();
	$("#output").append('<div class="text-center onetry" id="'+i+'"><p class="text-center">'+skratka[i]+' - '+vyklad[i]+'<br>'+en[i]+'<br>'+sk[i]+'</p><img id="'+i+'" class="draggable" src="img/'+pic[j]+'"></div>').hide().fadeIn(250);
	$("#turn").html((index)+"/"+(skratka.length+1)+" kolo");
	if ((back < 3) && (gamecount > 0)){
		$("#buttback").prop("disabled", false);
	} else {
		$("#buttback").prop("disabled", true);
	}
	if(visibleanswer) {
		visibleanswer = false;
		$(".answer").css('opacity', function(i, o){
		return parseFloat(o).toFixed(1) === '0' ? 0 : 1;
		});
	}
	savelocal()
	$( ".draggable" ).draggable({
		revert: true,
		/* containment: "#gameWindow", */
		zIndex: 10
	});
	$( ".answer" ).droppable({
		drop: checkAnswer 
	});
}
//=============================================================================

//Drag'n'drop------------------------------------------------------------------
function checkAnswer(event, ui){
	var textID = ui.draggable.attr("id");
	console.log(textID);
	var answer = $(this).attr("id");
	console.log(answer);
	if(answer == "nespravne"){
		if(textID == j){
			score-=0.5;
		} else {
			score++;
		}
	} else {
		if(textID != j){
			score-=0.5;
		} else {
			score++;
		}
	}
	$("#finished").append('<img src="img/'+pic[j]+'" draggable="false">');								//TODO <table>	//TODO <span>"'+vyklad[textID]+'"</span> 
	$(".Score").text("Skóre: " + score);
	
	gamecount++;
	nextTurn(++index);
	if(gamecount == 10){
		$("#turn").fadeOut(250);
		$("#output").fadeOut(250);
		$(".Timer").fadeOut(250);
		$(".Score").fadeOut(250);
		$("#posfinished").fadeOut(250);
		
		timedone = Math.round((new Date - start) / 1000, -1);
		timedone = Math.ceil(timedone);
		clearInterval(klok);
		visibleanswer = true;
		$(".answer").css('opacity', function(i,o){
			return parseFloat(o).toFixed(1) === '1' ? 1 : 0;
		});
		finalscore = (score - (timedone*0.05)).toFixed(1);
		if(checkhighscore(finalscore)){
			$('#board').empty();
			$('#board').append(finalscore);
		}
		savelocal();
		$('#Endgame').text("Koniec hry, tvoje skóre je " + finalscore + "b!");
	}
}
//=============================================================================

start = new Date;
var klok = setInterval(function() {$('.Timer').text("Uplynutý čas: " + Math.round((new Date - start) / 1000, 0) + "s");}, 1000);
clearInterval(klok);

//Highscore--------------------------------------------------------------------
function checkhighscore(currentscore){
	var a = parseInt(currentscore, 10);
	var b = parseInt($("#board").html(), 10);
	if(a >= b){
		return 1;
	} else {
		return 0;
	}
}
//=============================================================================

//Štart hry--------------------------------------------------------------------
function newgame(){
	generateGame();
	resetgame();
}
//=============================================================================

//Reset hry--------------------------------------------------------------------
function resetgame(){
	$('#Endgame').empty();
	$('.Timer').text('Uplynutý čas: 0s').fadeIn(0);
	$('.Score').text('Skóre: 0').fadeIn(0);
	$("#turn").fadeIn(0);
	
	$('#finished').empty();
	if(!amloading){
		gamecount = score = index = finalscore = timedone = back = 0;
	}
	$('#menu').empty();
	$('#menu').append('<li id="butt" class="list-group-item list-group-item-action bg-transparent" onclick="newgame()">Nová hra</li>');
	$('#menu').append('<li id="buttreset" class="list-group-item list-group-item-action bg-transparent" onclick="resetgame()">Opakovať hru</li><br>');
	$('#menu').append('<li id="buttsave" class="list-group-item list-group-item-action bg-transparent" onclick="savesession()">Uložiť hru</li>');
	$('#menu').append('<li id="buttload" class="list-group-item list-group-item-action bg-transparent" onclick="loadsession()">Načítať hru</li><br>');
	$('#menu').append('<li><button id="buttback" type="button" class="btn btn-outline-dark" onclick="goback()" disabled>&#60;== Vrátiť ťah</button></li>');
	if(klok != null) {clearInterval(klok);}
	start = new Date;
	klok = setInterval(function() {$('.Timer').text("Uplynutý čas: " + Math.round((new Date - start) / 1000, 0) + "s");}, 1000);
	nextTurn(index);
}
//=============================================================================

//Vrátenie kroku hry-----------------------------------------------------------
function goback(){
	if(gamecount == 10){
		$('#Endgame').empty();
		$('.Timer').text('Uplynutý čas: 0s').fadeIn(0);
		$('.Score').text('Skóre: 0').fadeIn(0);
		$("#turn").fadeIn(0);
	}
	gamecount--;
	score -= 0.5;
	$(".Score").text("Skóre: " + score);
	back++;
	$("#finished").children().last().remove();
	nextTurn(--index);
}
//=============================================================================

//Storage----------------------------------------------------------------------
function savesession(){
	if(gamecount < 10){
		sessionStorage.setItem("currentgame_J_key",  JSON.stringify(currentJ));
		sessionStorage.setItem("currentgame_I_key",  JSON.stringify(currentI));
		sessionStorage["gamecount_key"] = gamecount;
		sessionStorage["index_key"] = index;
		sessionStorage["score_key"] = score;
		sessionStorage["back_key"] = back;
		sessionStorage["finalscore_key"] = $("#board").html();
	} else {
		alert('Nemôžeš uložiť hotovú hru.');
	}
}

function savelocal(){
	localStorage.setItem("currentgame_J_key",  JSON.stringify(currentJ));
	localStorage.setItem("currentgame_I_key",  JSON.stringify(currentI));
	localStorage["gamecount_key"] = gamecount;
	localStorage["index_key"] = index;
	localStorage["score_key"] = score;
	localStorage["back_key"] = back;
	localStorage["finalscore_key"] = $("#board").html();
}

function loadsession(){
	if (sessionStorage.length > 0) {
		amloading = true;
		gamecount = sessionStorage["gamecount_key"];
		index = sessionStorage["index_key"]; 
		score = sessionStorage["score_key"];
		back = sessionStorage["back_key"];
		$("#board").html(sessionStorage["finalscore_key"]);
		
		currentJ = JSON.parse(sessionStorage.getItem("currentgame_J_key"));
		currentI = JSON.parse(sessionStorage.getItem("currentgame_I_key"));
		
		resetgame();
		$(".Score").text("Skóre: " + score);
		$('.Timer').text("Uplynutý čas: " + Math.round((new Date - start) / 1000, 0) + "s");
		
		for(k = 0; k <= index-1; k++){
			$("#finished").append('<img src="img/'+pic[currentJ[k]]+'" draggable="false">');		//TODO <table>
		}
		amloading = false;
	} else {
		alert("Žiadna hra nieje uložená.");
	}
}

$(document).ready(function() {
	if (localStorage.length > 0){
		if (localStorage.gamecount_key < 10) {
			amloading = true;
			gamecount = localStorage["gamecount_key"];
			index = localStorage["index_key"]; 
			score = localStorage["score_key"];
			back = localStorage["back_key"];
			$("#board").html(localStorage["finalscore_key"]);
			
			currentJ = JSON.parse(localStorage.getItem("currentgame_J_key"));
			currentI = JSON.parse(localStorage.getItem("currentgame_I_key"));
			
			resetgame();
			$(".Score").text("Skóre: " + score);
			$('.Timer').text("Uplynutý čas: " + Math.round((new Date - start) / 1000, 0) + "s");
		
			for(k = 0; k <= index-1; k++){
				$("#finished").append('<img src="img/'+pic[currentJ[k]]+'" draggable="false">');		//TODO <table> or <div>
			}
			amloading = false;
		} else {
			$("#board").html(localStorage["finalscore_key"]);
		}
	}
});

function clearStorage(){
	localStorage.clear();
	window.location.replace('index.html');
	window.location.replace('index.html');
}
//=============================================================================