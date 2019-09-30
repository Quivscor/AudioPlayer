var song;
var ampHistory = [];
var spectrumSong;

var loading = false;

var input;

var amp;
var fft;
var mic;

var button;
var sliderVolume;
var sliderPan;
var sliderRate;

function setup()
{
    soundFormats('wav', 'mp3');
    colorMode(HSB);

    createCanvas(640, 480);
    input = createFileInput(loadSong);
    input.input(loadSong);
    input.position(6 * width / 10, (8 * height / 10));
    sliderVolume = createSlider(0, 1, 0.5, 0.01);
    sliderVolume.position(width / 10, (7 * height / 10));
    sliderRate = createSlider(0, 2, 1, 0.01);
    sliderRate.position(width/ 10, (8 * height / 10));
    sliderPan = createSlider(-1, 1, 0, 0.01);
    sliderPan.position(width/ 10, (9 * height / 10));
    button = createButton("loading");
    button.mousePressed(togglePlaying);
    button.position(6 * width/ 10, (7 * height / 10));
    amp = new p5.Amplitude();
    fft = new p5.FFT(0.8, 64);
    mic = new p5.AudioIn();
    mic.start();
}

function loadSong(file)
{
    loading = true;
    button.html("loading");
    if(song != null)
    {
        if(song.isPlaying())
        {
            song.stop();
        }
    }
    spectrumSong = 0;
    ampHistory.splice(0,ampHistory.length);

    if(file.type == 'audio')
        song = loadSound(file.name, onLoadSong);
    else
    {
        button.html("wrong file");
        song = new p5.SoundFile();
        return;
    }

    amp.setInput(song);
    console.log(file);
}

function onLoadSong()
{
    loading = false;
    button.html("play");
    console.log("Audio file loaded.");
}

function togglePlaying()
{
    if(song == null)
    {
        button.html("loading");
    }
    if(!song.isPlaying())
    {
        song.play()
        button.html("pause");
    }
    else
    {
        song.pause();
        button.html("play");
    }
}

function secondsToMinutes(time)
{
    var seconds = Math.round(time);
    var minutes = parseInt(seconds / 60);
    if(seconds < 10)
        return (minutes + ':0' + (seconds % 60));
    else
        return (minutes + ':' + (seconds % 60));
}

function draw()
{
    background(40);

    fill(30);
    rect(0, 6.5 * height / 10, width, height);
    rect(0, 2 * height / 10, width, 24);
    rect(0, 5.5 * height / 10 - 9, width, 24);

    textSize(18);
    noStroke();
    fill(0,0,0);
    text('Volume', 4 * width / 10, (7 * height / 10) + 9);
    text('Rate', 4 * width / 10, (8 * height / 10) + 9);
    text('Pan', 4 * width / 10, (9 * height / 10) + 9);
    if(song != null)
    {
        song.setVolume(sliderVolume.value());
        song.pan(sliderPan.value());
        song.rate(sliderRate.value());

        var volMic = mic.getLevel();
        fill(255);
        ellipse( 9 * width/10, 9 * height/10, volMic * 500, volMic * 500);

        // Amplitude graph
        stroke(0);
        beginShape();
        noFill();
        var volSong = amp.getLevel();
        spectrumSong = fft.analyze();
        // Process song if is playing
        if(song.isPlaying())
        {
            ampHistory.push(volSong);
        }
    
        for(var i = 0; i < ampHistory.length; i++)
        {
            var y = map(ampHistory[i], 0, 1, height / 6, 0);
            vertex(i, y);
        }
        endShape();

        if(ampHistory.length > width)
        {
            ampHistory.splice(0, 1);
        }

        textSize(18);
        noStroke();
        fill(0,0,0);
        text(secondsToMinutes(song.currentTime()), width / 10, (2 * height / 10) + 18);
        text('/', width / 10 + 40, (2 * height / 10) + 18);
        text(secondsToMinutes(song.duration()), width / 10 + 56, (2 * height / 10) + 18);

        //Audio spectrum graph
        for(var i = 0; i < spectrumSong.length; i++)
        {
            var spectrum = spectrumSong[i];
            var y = map(spectrum, 0, 255, 3 * height / 6, height / 3);
            fill(255, i, i);
            rect(i * (width/64), (3 * height / 6), (width/64), y - (3 * height / 6));
        }

        textSize(18);
        noStroke();
        fill(0,0,0);
        text('20Hz', 0 + 9, (5.5 * height / 10) + 9);
        text('2MHz', 9 * width / 10, (5.5 * height / 10) + 9);

        if(!song.isPlaying() && !loading)
        {
            button.html("play");
        }
    }
}