const audio = document.getElementById('audio');
const playButton = document.getElementById('playButton');
const equalizer = document.getElementById('equalizer');

let audioCtx, analyser, source, dataArray;

const numCols = 5; // ahora solo 5 columnas
const ledsPerCol = 15;
const cols = [];

for (let i = 0; i < numCols; i++) {
  const col = document.createElement('div');
  col.classList.add('led-col');
  const leds = [];
  for (let j = 0; j < ledsPerCol; j++) {
    const led = document.createElement('div');
    led.classList.add('led');
    col.appendChild(led);
    leds.push(led);
  }
  equalizer.appendChild(col);
  cols.push(leds);
}

playButton.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    animateEQ();
  }

  if (audio.paused) {
    audio.play();
    playButton.textContent = "⏸ Pausar";
  } else {
    audio.pause();
    playButton.textContent = "▶ Reproducir";
  }
});

function animateEQ() {
  requestAnimationFrame(animateEQ);
  analyser.getByteFrequencyData(dataArray);

  const chunkSize = Math.floor(dataArray.length / numCols);
  cols.forEach((leds, colIdx) => {
    let sum = 0;
    for (let i = 0; i < chunkSize; i++) {
      sum += dataArray[colIdx * chunkSize + i];
    }
    let avg = sum / chunkSize;

    // Escala en forma de V
    let scale = 1;
    if (colIdx === 2) scale = 1.2;   // barra central
    if (colIdx === 1 || colIdx === 3) scale = 1.0; // intermedias
    if (colIdx === 0 || colIdx === 4) scale = 0.8; // extremos más bajos

    let level = Math.max(2, Math.floor((avg / 255) * ledsPerCol * scale));

    leds.forEach((led, i) => {
      if (i < level) {
        if (i > ledsPerCol * 0.7) {
          led.style.background = "red";
        } else if (i > ledsPerCol * 0.4) {
          led.style.background = "yellow";
        } else {
          led.style.background = "lime";
        }
        led.style.opacity = 1;
      } else {
        led.style.background = "#111";
        led.style.opacity = 0.2;
      }
    });
  });
}
