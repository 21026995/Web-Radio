let songs = []; // Array to store multiple songs
let currentSongIndex = 0;
let song;
let isPlaying = false;
let volume = 0.5; // Initial volume
const JAMENDO_API_KEY = '0d6e1423';

// Create a new speech recognition object
let speechRec;

function setup() {
  createCanvas(windowWidth, windowHeight);
  canvas = document.querySelector('canvas');

  // Initialize speech recognition
  speechRec = new p5.SpeechRec();
  speechRec.continuous = true;
  speechRec.interimResults = false;

  // Add a listener for speech recognition results
  speechRec.onResult = interpretSpeech;

  // Start speech recognition
  speechRec.start();

  // Start playing the first song
  findNewSongUrlAndPlay();
}

function findNewSongUrlAndPlay() {
  // Construct the API request URL
  let apiUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_API_KEY}&format=json&limit=1`;

  // Perform the API request to Jamendo to fetch a new song URL
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        // Extract the new song URL from the API response
        let newSongUrl = data.results[0].audio;
        loadAndPlaySong(newSongUrl);

        // Display song information
        displaySongInfo(data.results[0]);
      } else {
        console.error('No songs found in the API response.');
      }
    })
    .catch(error => {
      console.error('Error fetching new song URL:', error);
    });
}

function loadAndPlaySong(url) {
  // Load the new song from the provided URL
  song = loadSound(url, () => {
    // Once the song is loaded, play it
    song.play();
    isPlaying = true;
  });
  song.onended(changeSong);
}

function draw() {
  background(220);

  // Display commands
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text('Commands:', 20, 40);
  text('- "Play" or "Pause" to toggle play/pause', 20, 70);
  text('- "Volume up" or "Volume down" to adjust volume', 20, 100);
  text('- "Next song" to play the next song', 20, 130);

  // Display currently playing song information
  if (song && isPlaying) {
    fill(0);
    textSize(20);
    textAlign(CENTER);
    text(`Now Playing: ${song.name}`, width / 2, height - 50);
    text(`Artist: ${song.artist_name}`, width / 2, height - 20);
  }
}

function interpretSpeech() {
  // Get the latest result from speech recognition
  let result = speechRec.resultString.toLowerCase();

  // Check for commands
  if (result.includes('play') || result.includes('pause')) {
    togglePlayPause();
  } else if (result.includes('volume up')) {
    adjustVolume(0.1);
  } else if (result.includes('volume down')) {
    adjustVolume(-0.1);
  } else if (result.includes('next song')) {
    changeSong();
  }
}

function togglePlayPause() {
  if (isPlaying) {
    song.pause();
  } else {
    song.play();
  }
  isPlaying = !isPlaying;
}

function adjustVolume(change) {
  volume += change;
  volume = constrain(volume, 0, 1);
  song.setVolume(volume);
}

function changeSong() {
  // Stop the current song
  song.stop();
  
  // Find and play a new song URL
  findNewSongUrlAndPlay();
}

function displaySongInfo(songData) {
  console.log('Song Data:', songData);

  let songName = songData.name || songData.title || songData.track_name || 'Unknown Song';
  let artistName = songData.artist_name || songData.artist || songData.artist_info || 'Unknown Artist';
  // Log song information to the console
  console.log('Now Playing:', songData.name);
  console.log('Artist:', songData.artist_name);
}
