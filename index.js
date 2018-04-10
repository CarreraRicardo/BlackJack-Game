 var express = require('express');
 var app = express();
 var http = require('http').Server(app);
 var io = require('socket.io')(http);

 app.use(express.static('public'));

 var totalPlayers = 2;


// Arreglo asociativo que va a contener a todos los jugadores 

 var playersList  = {};

 var arrayPlayers = [];

 var indexConcurrency = 0;
 
 var cardsInGame = [];

 var totalDrawPlayersCards = [];

 var  allCards = []; //arreglo para saber cuales cartas ya han sido entregadas y no repetir las mismas

 var booleanContains = null;

 var scorePlayers = [];

 var scorePlayer = null;

 var scoreDealer = null;

 var dealerCards = [];

 var totalDrawDealerCards = 0;

 var newAdvice = null;

 var playersBet = [false,false,false,false,false]; // arreglo para saber si un jugador pico deal, si pico deal podra dejarle sacar cartas o quedarse en stand

 var playersMoney = [1000,1000,1000,1000,1000]; // la cantidad inicial que tienen los jugadores

 var capturePlayersBet = []; // en este arreglo se guarda la cantidad que el jugador esta apostando  

  //Mapeo de la tabla de 21

  var playerHand = new Map();

  var handTwelve = new Map();
  handTwelve.set(2,"HIT");
  handTwelve.set(3,"HIT");
  handTwelve.set(4,"STAND");
  handTwelve.set(5,"STAND");
  handTwelve.set(6,"STAND");
  handTwelve.set(7,"HIT");
  handTwelve.set(8,"HIT");
  handTwelve.set(9,"HIT");
  handTwelve.set(10,"HIT");
  handTwelve.set(11,"HIT");

  playerHand.set(12,handTwelve);

  var handThirteen = new Map();
  handThirteen.set(2,"STAND");
  handThirteen.set(3,"STAND");
  handThirteen.set(4,"STAND");
  handThirteen.set(5,"STAND");
  handThirteen.set(6,"STAND");
  handThirteen.set(7,"HIT");
  handThirteen.set(8,"HIT");
  handThirteen.set(9,"HIT");
  handThirteen.set(10,"HIT");
  handThirteen.set(11,"HIT");

  playerHand.set(13,handThirteen);

  var handFourteen = new Map();

  handFourteen.set(2,"STAND");
  handFourteen.set(3,"STAND");
  handFourteen.set(4,"STAND");
  handFourteen.set(5,"STAND");
  handFourteen.set(6,"STAND");
  handFourteen.set(7,"HIT");
  handFourteen.set(8,"HIT");
  handFourteen.set(9,"HIT");
  handFourteen.set(10,"HIT");
  handFourteen.set(11,"HIT");

  playerHand.set(14,handFourteen);

  var handFifteen = new Map();
  handFifteen.set(2,"STAND");
  handFifteen.set(3,"STAND");
  handFifteen.set(4,"STAND");
  handFifteen.set(5,"STAND");
  handFifteen.set(6,"STAND");
  handFifteen.set(7,"HIT");
  handFifteen.set(8,"HIT");
  handFifteen.set(9,"HIT");
  handFifteen.set(10,"HIT");
  handFifteen.set(11,"HIT");

  playerHand.set(15,handFifteen);

  var handSixteen = new Map();
  handSixteen.set(2,"STAND");
  handSixteen.set(3,"STAND");
  handSixteen.set(4,"STAND");
  handSixteen.set(5,"STAND");
  handSixteen.set(6,"STAND");
  handSixteen.set(7,"HIT");
  handSixteen.set(8,"HIT");
  handSixteen.set(9,"HIT");
  handSixteen.set(10,"HIT");
  handSixteen.set(11,"HIT");

  playerHand.set(16,handSixteen);
 

// Termina mapeo de la tabla de 21


 app.get('/', function(req,res)
 {
	res.sendFile(__dirname + '/prueba.html');
});

 io.on('connection',function(socket){

 	console.log("a user connected");

 	/*
		Id que va tener la el jugador cuando ingrese

 	*/

 	socket.id = Math.random();

 	//console.log(socket.id);

 	

 	socket.emit('idPlayer',socket.id); 


	socket.on('joinPlayer',function(playerId){

		playersList[playerId] = playerId;


		arrayPlayers.push(playerId);

		if(arrayPlayers.length === totalPlayers)
		{
			
			io.emit('fullPlayers');


			

			/*
				while para las carta del dealer al inicio de un nuevo juego

			*/

			var k = 0;

			while(k < 1)
			{
				var card = deal();
				booleanContains = allCards.includes(card);

				if(!booleanContains)
				{
					allCards.push(card);
					scoreDealer = getValue(card);
					dealerCards.push(card);
					dealerCards.push(scoreDealer);
					totalDrawDealerCards++;
					k++;

				}
		
			}

			for(var i = 0; i < totalPlayers; i++)
			{	
				var drawPlayerCard = 0; // contador saber cuantas cartas tiene el jugador y no se pase del limite

				array = new Array();

				var j = 0;

				while(j < 2)
				{

					var card = deal();

					booleanContains = allCards.includes(card);
				
					if(!booleanContains)
					{	

						scorePlayer += getValue(card);

						array.push(card);
						allCards.push(card);
						j++;
						drawPlayerCard++;

					}

				}

				console.log("Total de las cartas: " + scorePlayer);

				array.push(scorePlayer);

				if(scorePlayer <= 11 && scorePlayer >= 4)
				{
					array.push("HIT");
				}
				else if(scorePlayer >= 17 && scorePlayer <= 21)
				{
					array.push("STAND");
				}
				else
				{
					array.push(playerHand.get(scorePlayer).get(scoreDealer));
				}

				scorePlayers.push(scorePlayer);

				scorePlayer = 0;

				array.push(playersMoney[i]);

				cardsInGame.push(array);

				totalDrawPlayersCards.push(drawPlayerCard);

				


			}

			
			io.emit('startGame',cardsInGame,dealerCards);

			


		}

		else
		{
			socket.emit('waitingPlayers');
			console.log("Esperando jugadores");

		}



	});

	socket.on('disconnect', function(){

		console.log("user disconnected");

		delete playersList[socket.id];

		var findIndex = arrayPlayers.indexOf(socket.id); //Encontrar index a borrar del arreglo 

		arrayPlayers.splice(findIndex,1);
		
	});

	socket.on('bet',function(playerBet){


		capturePlayersBet.push(playerBet);
		/*
		for(var i = 0; i < capturePlayersBet.length; i++)
		{
			console.log("Apuestas: " + capturePlayersBet[i] + ",");
		}

		*/

		console.log("Tamaño: " + capturePlayersBet.length);

	});

	socket.on('deal',function(playerId){

		playersBet[indexConcurrency] = true;


	});

	socket.on('hitCard',function(playerId){

		console.log("Este jugador esta haciendo la peticion: " + playerId);

		if(playerId === arrayPlayers[indexConcurrency] && playersBet[indexConcurrency] == true)
		{
			//console.log("Este jugador hizo la peticion: " + playerId + "," + cardsInGame[indexConcurrency][0] );


			if(totalDrawPlayersCards[indexConcurrency] < 5)
			{	

				var drawOne = 0;

				while(drawOne < 1)
				{
					var card = deal();
	                booleanContains = allCards.includes(card);


	                if(!booleanContains)
	                {
						allCards.push(card);

						scorePlayers[indexConcurrency] += getValue(card);

						if(scorePlayers[indexConcurrency] <= 11 && scorePlayer >= 4)
						{
							newAdvice = "HIT"
						}
						else if(scorePlayers[indexConcurrency] >= 17 && scorePlayer <= 21)
						{
							newAdvice = "STAND";
						}
						else
						{
							newAdvice = playerHand.get(scorePlayers[indexConcurrency]).get(scoreDealer);
						}


						console.log("Nuevo Score del jugador: " + scorePlayers[indexConcurrency]);

						totalDrawPlayersCards[indexConcurrency]++;

						io.emit('onHitCard',card,indexConcurrency,scorePlayers[indexConcurrency],newAdvice);

						drawOne++;
	                }
				}

				
			}
			else
			{
				console.log("El jugador " + playerId + " tiene " + totalDrawPlayersCards[indexConcurrency] + " cartas");
			}

		}

	});

	socket.on('stand',function(playerId){

		if(playerId === arrayPlayers[indexConcurrency] && playersBet[indexConcurrency] == true)
		{
			indexConcurrency ++;
		}
		//console.log("Valor de la concurrencia: " + indexConcurrency);

		if(indexConcurrency === totalPlayers)
		{	
			/*
			for(var i =0 ; i < totalPlayers; i++)
			{
				console.log("Jugador: " + (i+1) + "Score: " + scorePlayers[i]);
			}

			*/

			while(scoreDealer < 17 && totalDrawDealerCards < 5)
			{
				var card = deal();
				booleanContains = allCards.includes(card);

				if(!booleanContains)
				{	
					allCards.push(card);
					dealerCards.push(card);
					scoreDealer += getValue(card);
					totalDrawDealerCards++;

					//console.log("Score Dealer: " + scoreDealer+ " Total Cartas Dealer: " + totalDrawDealerCards);
				}
			}


			winners();


			io.emit('dealerScoreFinal',dealerCards,scoreDealer);

			resetValuesGame(); // reseteamos para un nuevo juego

			waitTimeNewGame();

			
			//restartGame(); // emite las cartas para un nuevo juegos, lo puedo usar cuando emita el cliente


		}
		
	});

 	/* loop para que este habilitando los botones al jugadores que le corresponde */

 	setInterval(function(){

 		io.emit('canClick',arrayPlayers[indexConcurrency]);

 	},1000/25);


});


 http.listen(3000, function(){
	console.log("listening on *:3000");
});

 var deal = function() 
 {
  
  card = Math.floor(Math.random()*52+1);
  
  return card;

};

var getValue = function(card) {
  // if its a face card, number should be set to 10
    if(card % 13 == 0 || card % 13 == 11 || card % 13 == 12){ //// 0 == rey, 11 == j , 12 == Q
        
        return 10;
    }
    else if(card % 13 == 1){ // 1 == AS valor para el as de 11
        
        return 11;
    }
    else{
        
        return card % 13;
    }

}

function score() {

  return getValue(card1) + getValue(card2);
}

function restartGame()
{	

	var k = 0;

			while(k < 1)
			{
				var card = deal();
				booleanContains = allCards.includes(card);

				if(!booleanContains)
				{
					allCards.push(card);
					scoreDealer = getValue(card);
					dealerCards.push(card);
					dealerCards.push(scoreDealer);
					totalDrawDealerCards++;
					k++;

				}
		
			}

			console.log("total de jugadores despues del restart: " + totalPlayers);

			for(var i = 0; i < totalPlayers; i++)
			{	
				var drawPlayerCard = 0; // contador saber cuantas cartas tiene el jugador y no se pase del limite

				array = new Array();

				var j = 0;

				while(j < 2)
				{

					var card = deal();

					booleanContains = allCards.includes(card);
				
					if(!booleanContains)
					{	

						scorePlayer += getValue(card);

						array.push(card);
						allCards.push(card);
						j++;
						drawPlayerCard++;

					}

				}

				console.log("Total de las cartas: " + scorePlayer);

				array.push(scorePlayer);

				if(scorePlayer <= 11 && scorePlayer >= 4)
				{
					array.push("HIT");
				}
				else if(scorePlayer >= 17 && scorePlayer <= 21)
				{
					array.push("STAND");
				}
				else
				{
					array.push(playerHand.get(scorePlayer).get(scoreDealer));
				}

				scorePlayers.push(scorePlayer);

				scorePlayer = 0;

				array.push(playersMoney[i]);

				cardsInGame.push(array);

				totalDrawPlayersCards.push(drawPlayerCard);

				


			}

			
			io.emit('startGame',cardsInGame,dealerCards);


}

function resetValuesGame()
{
	indexConcurrency = 0;

	console.log("Valor de la concurrencia: " + indexConcurrency + "," +arrayPlayers.length);

	cardsInGame = [];

	totalDrawPlayersCards = [];

    allCards = []; //arreglo para saber cuales cartas ya han sido entregadas y no repetir las mismas

	booleanContains = null;

	scorePlayers = [];

	scorePlayer = null;

	scoreDealer = null;

	dealerCards = [];

	totalDrawDealerCards = 0;

	newAdvice = null;

	playersBet = [false,false,false,false,false];

	capturePlayersBet = [];
}

function waitTimeNewGame()
{

	setTimeout(function(){

	  restartGame();

	},4000);


}

function winners()
{

	for(var i = 0; i < arrayPlayers.length; i++)
	{
		if(scoreDealer == 21)
		{
			if(scorePlayers[i] != 21)
			{
				playersMoney[i] -= capturePlayersBet[i];
			}
			else if(scorePlayers[i] == 21)
			{
				playersMoney[i] = playersMoney[i];
			}
		}

		if(scoreDealer > 21)
		{
			if(scorePlayers[i] <= 21)
			{
				playersMoney[i] += capturePlayersBet[i];
			}
			else
			{
				playersMoney[i] -= capturePlayersBet[i];
			}
		}

		if(scoreDealer < 21 && scoreDealer > scorePlayers[i])
		{
			playersMoney[i] -= capturePlayersBet[i];
		}
		else if(scoreDealer < 21 && scoreDealer < scorePlayers[i] && scorePlayers[i] <= 21)
		{
			playersMoney[i] += capturePlayersBet[i];
		}
		else if(scoreDealer < 21 && scorePlayers[i] > 21)
		{
			playersMoney[i] -= capturePlayersBet[i];
		}

		if(scoreDealer == scorePlayers[i])
		{
			playersMoney[i] = playersMoney[i];
		}
	}	

}

