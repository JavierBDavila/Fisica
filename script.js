document.addEventListener('DOMContentLoaded', function () {
  // Elementos visuales
  const sourceCanvas = document.getElementById('movingSourceCanvas');
  const sourceContainer = document.getElementById('movingSourceContainer');
  const movingSource = document.getElementById('movingSource');

  sourceCanvas.width = sourceContainer.offsetWidth;
  sourceCanvas.height = sourceContainer.offsetHeight;

  const sourceCtx = sourceCanvas.getContext('2d');
  let sourceWaves = [];

  let isDraggingSource = false;
  let lastSourceWaveTime = 0;

  const AUTO_WAVE_INTERVAL = 250;
  const WAVE_INTERVAL = 150;

  let sourcePosition = 50;
  let sourceDirection = 1;
  let sourceVelocity = 2.5;
  let sourceMoving = false;

  const waveColors = ['#3a0ca3', '#7209b7', '#4895ef'];

  class Wave {
    constructor(x, y, velocityX = 0, velocityY = 0) {
      this.x = x;
      this.y = y;
      this.velocityX = velocityX;
      this.velocityY = velocityY;
      this.radius = 10;
      this.speed = 2;
      this.opacity = 0.8;
      this.decay = 0.01; // se desvanece más rápido
      this.color = waveColors[Math.floor(Math.random() * waveColors.length)];
    }

    update() {
      this.radius += this.speed;
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.opacity -= this.decay;
      return this.opacity > 0;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function createSourceWave() {
  const sourceRect = movingSource.getBoundingClientRect();
  const canvasRect = sourceCanvas.getBoundingClientRect();

  const waveX = sourcePosition + movingSource.offsetWidth / 2;
  const waveY = sourceRect.top + movingSource.offsetHeight / 2 - canvasRect.top;

  const velocityX = sourceDirection * 1;
  sourceWaves.push(new Wave(waveX, waveY, velocityX, 0));
}




  function animateSourceWaves() {
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceWaves = sourceWaves.filter(w => w.update());
    sourceWaves.forEach(w => w.draw(sourceCtx));
    requestAnimationFrame(animateSourceWaves);
  }

  function animateSource() {
    if (!sourceMoving || isDraggingSource) return;
    sourcePosition += sourceDirection * sourceVelocity;
    if (sourcePosition < 0 || sourcePosition > sourceContainer.offsetWidth - movingSource.offsetWidth) {
      sourceDirection *= -1;
    }

    movingSource.style.left = `${sourcePosition}px`;

    const now = Date.now();
    if (now - lastSourceWaveTime > AUTO_WAVE_INTERVAL) {
      createSourceWave();
      lastSourceWaveTime = now;
    }
  }

  setInterval(animateSource, 16);

  // Interacción de arrastre
  movingSource.addEventListener('mousedown', () => {
    isDraggingSource = true;
    sourceMoving = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDraggingSource) {
      const rect = sourceContainer.getBoundingClientRect();
      let newX = e.clientX - rect.left - movingSource.offsetWidth / 2;
      newX = Math.max(0, Math.min(newX, sourceContainer.offsetWidth - movingSource.offsetWidth));
      sourcePosition = newX;
      movingSource.style.left = `${sourcePosition}px`;

      const now = Date.now();
      if (now - lastSourceWaveTime > WAVE_INTERVAL) {
        createSourceWave();
        lastSourceWaveTime = now;
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDraggingSource = false;
  });

  // Botones
  document.getElementById('toggleAnimation').addEventListener('click', function () {
    sourceMoving = !sourceMoving;
    this.innerHTML = sourceMoving
      ? '<span class="icon">⏸️</span> Pausar fuente móvil'
      : '<span class="icon">▶️</span> Iniciar fuente móvil';
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    sourceWaves = [];
    this.innerHTML = '<span class="icon">✓</span> Ondas limpiadas';
    setTimeout(() => {
      this.innerHTML = '<span class="icon">🧹</span> Limpiar ondas';
    }, 1000);
  });

  document.getElementById('helpBtn').addEventListener('click', function () {
    alert(`Simulación del Efecto Doppler:\n\n1. Arrastra el círculo rojo para mover la fuente.\n2. Pulsa el botón para iniciar la animación automática.\n3. Observa cómo cambia la frecuencia de las ondas dependiendo del movimiento.`);
  });

  // Calculadora Doppler
  function initDopplerCalculator() {
    const frequencyInput = document.getElementById('frequency');
    const sourceSpeedInput = document.getElementById('sourceSpeed');
    const observerSpeedInput = document.getElementById('observerSpeed');
    const waveSpeedSelect = document.getElementById('waveSpeed');
    const customWaveSpeed = document.getElementById('customWaveSpeed');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultValue = document.querySelector('.result-value');
    const resultChange = document.querySelector('.result-change');

    waveSpeedSelect.addEventListener('change', function () {
      if (this.value === 'custom') {
        customWaveSpeed.classList.remove('hidden');
        customWaveSpeed.focus();
      } else {
        customWaveSpeed.classList.add('hidden');
      }
    });

    function calculateDopplerEffect() {
      const f = parseFloat(frequencyInput.value) || 440;
      const vs = parseFloat(sourceSpeedInput.value) || 0;
      const vo = parseFloat(observerSpeedInput.value) || 0;
      let v = waveSpeedSelect.value === 'custom' ? parseFloat(customWaveSpeed.value) || 343 : parseFloat(waveSpeedSelect.value);
      const direction = document.querySelector('input[name="direction"]:checked').value;

      let fPrime;
      if (direction === 'approaching') {
        fPrime = f * (v + vo) / (v - vs);
      } else {
        fPrime = f * (v - vo) / (v + vs);
      }

      if (isNaN(fPrime) || !isFinite(fPrime)) {
        resultValue.textContent = "Inválido";
        resultChange.textContent = "Combinación imposible";
        return;
      }

      resultValue.textContent = `${fPrime.toFixed(2)} Hz`;
      const changePercent = ((fPrime - f) / f * 100).toFixed(1);
      if (Math.abs(changePercent) > 0.1) {
        const changeText = changePercent > 0 ? `(+${changePercent}%)` : `(${changePercent}%)`;
        resultChange.textContent = changeText;
        resultValue.style.color = changePercent > 0 ? '#f72585' : '#4361ee';
        resultChange.style.color = resultValue.style.color;
      } else {
        resultChange.textContent = "(sin cambio)";
        resultValue.style.color = '#14213d';
        resultChange.style.color = '#14213d';
      }

      resultValue.style.transform = 'scale(1.1)';
      setTimeout(() => {
        resultValue.style.transform = 'scale(1)';
      }, 300);
    }

    calculateBtn.addEventListener('click', calculateDopplerEffect);
    [frequencyInput, sourceSpeedInput, observerSpeedInput, waveSpeedSelect, customWaveSpeed].forEach(input => {
      input.addEventListener('input', calculateDopplerEffect);
    });
    document.querySelectorAll('input[name="direction"]').forEach(radio => {
      radio.addEventListener('change', calculateDopplerEffect);
    });

    calculateDopplerEffect(); // inicial
  }

  // Iniciar
  animateSourceWaves();
  initDopplerCalculator();

  setTimeout(() => {
    console.log('%cSimulación Doppler lista.', 'color: #00b4d8; font-weight: bold; font-size: 14px;');
  }, 500);
});

const container = document.querySelector('.demo-container');
const source = document.getElementById('source');

function createWave() {
  // Obtener posición actual de la bolita
  const rect = source.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const leftPos = rect.left - containerRect.left;

  // Crear el elemento onda
  const wave = document.createElement('div');
  wave.classList.add('wave');

  // Posicionar la onda en la posición actual de la bolita
  wave.style.left = `${leftPos}px`;
  container.appendChild(wave);

  // Cuando termine la animación, eliminar la onda del DOM
  wave.addEventListener('animationend', () => {
    wave.remove();
  });
}

// Crear una onda cada 1 segundo
setInterval(createWave, 1000);
