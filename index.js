const fs = require('fs');
const process = require('process');
const request = require('request');
const readline = require('readline');

//.............API URL for fetching jokes...........//

const JOKE_API_URL = 'https://icanhazdadjoke.com/search';


//............. Function to get a random joke from a list.............//

function getRandomJoke(jokesList) {
  const randomIndex = Math.floor(Math.random() * jokesList.length);
  return jokesList[randomIndex];
}

//.............. Function to save a joke to the jokes.txt..............//

function saveJokeToFile(joke, rating) {
  fs.appendFile('jokes.txt', `${joke}:${rating}\n`, (error) => {
    if (error) throw error;
    console.log(`Joke saved to jokes.txt with rating: ${rating}`);
  });
}

//...............Function to get the highest-rated joke from a list............//

function getHighestRatedJoke(jokesList) {
  const highestRatedJoke = jokesList.reduce((prevJoke, currentJoke) => {
    const [, prevRating] = prevJoke.split(':');
    const [, currentRating] = currentJoke.split(':');
    return parseInt(prevRating) > parseInt(currentRating) ? prevJoke : currentJoke;
  });

  return highestRatedJoke;
}

//...........Function to display the highest-rated joke....................//

function displayHighestRatedJoke(joke) {
  const [, rating] = joke.split(':');
  console.log(`Joke leaderboard (Rating: ${rating} out of 10)`);
  console.log(`"${joke}"`);
}

//..........Function to fetch jokes based on a search term..................//

function fetchJokes(searchTerm) {
  const options = {
    url: `${JOKE_API_URL}?term=${searchTerm}`,
    headers: {
      'Accept': 'application/json',
    },
  };

  request(options, (error, response, body) => {
    if (error) {
      console.error('Error connecting to the joke API');
      return;
    }

    const jsonData = JSON.parse(body);
    const jokesList = jsonData.results;

    if (jokesList.length > 0) {
      const selectedJoke = getRandomJoke(jokesList).joke;
      console.log('Here is a joke for you:');
      console.log(`"${selectedJoke}"`);


      //................Use readline to get user input for rating..............//

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Rate the joke out of 10: ', (rating) => {
        saveJokeToFile(selectedJoke, rating);
        rl.close();
      });
    } else {
      console.log(`No jokes found for the term "${searchTerm}". Maybe the joke gods are on vacation.`);
    }
  });
}

//..........Command line argument handling...............//

const searchTerm = process.argv[2];

//...........Check if the searchTerm is for leaderboard or fetching jokes............//

if (searchTerm === 'leaderboard') {
  fs.readFile('jokes.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading jokes.txt file.');
      return;
    }

    const jokesList = data.split('\n').filter(joke => Boolean(joke));

    if (jokesList.length > 0) {
      const highestRatedJoke = getHighestRatedJoke(jokesList);
      displayHighestRatedJoke(highestRatedJoke);
    } else {
      console.log('The jokes.txt file is empty');
    }
  });
} else {
  fetchJokes(searchTerm);
}
