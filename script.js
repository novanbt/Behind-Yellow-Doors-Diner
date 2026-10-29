/**
 * Behind Yellow Doors Diner - Interactive 3D Door Experience
 * Handles smooth scroll physics, 3D perspective rotation, procedural sound FX,
 * and responsive interaction.
 */

(function () {
  'use strict';

  // DOM Elements
  const viewport = document.getElementById('viewport');
  const door = document.getElementById('door');
  const doorHandle = document.getElementById('doorHandle');
  const whiteScreen = document.getElementById('whiteScreen');
  const doorShadow = document.getElementById('doorShadow');
  const scrollHint = document.getElementById('scrollHint');
  const progressBar = document.getElementById('progressBar');
  const closeDoorHint = document.getElementById('closeDoorHint');

  // Animation & Physics State
  let targetProgress = 0;   // 0.0 (closed) to 1.0 (fully open)
  let currentProgress = 0;  // Interpolated progress
  let velocity = 0;
  const LERP_FACTOR = 0.09;
  const SCROLL_SENSITIVITY = 0.0013;
  const MAX_DOOR_ANGLE = -112; // Degrees to swing open

  // Drag & Touch State
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startProgress = 0;

  // Sound Engine (Web Audio API - Procedural, no external files)
  let audioCtx = null;
  let soundEnabled = true;
  let hasUnlatched = false;
  let hasLatched = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize mechanical brass latch sound
  function playLatchSound(type = 'open') {
    if (!soundEnabled || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(type === 'open' ? 2200 : 1600, now);
      filter.Q.setValueAtTime(4.0, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(type === 'open' ? 520 : 380, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.09);

      // Add a metallic click rattle
      const click = audioCtx.createBufferSource();
      const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.04, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.008));
      }
      click.buffer = buffer;
      const clickGain = audioCtx.createGain();
      clickGain.gain.setValueAtTime(0.18, now);
      click.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      click.start(now);
    } catch (e) {
      // Audio fallback silent
    }
  }

  // Synthesize subtle wooden hinge groan / air push
  let creakTimeout = 0;
  function playCreakSound() {
    if (!soundEnabled || !audioCtx) return;
    const now = performance.now();
    if (now - creakTimeout < 220) return;
    creakTimeout = now;

    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      osc.type = 'sawtooth';
      const startFreq = 75 + Math.random() * 30;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.linearRampToValueAtTime(startFreq + (Math.random() * 40 - 20), t + 0.16);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.19);
    } catch (e) {}
  }

  // Handle Wheel Scroll
  function handleWheel(e) {
    initAudio();

    // If door is completely open and user is scrolling down inside white screen, allow natural content scroll
    if (currentProgress >= 0.99 && e.deltaY > 0) {
      return;
    }

    // If door is completely open and user is scrolling up at top of white screen, close the door
    if (currentProgress >= 0.99 && e.deltaY < 0 && whiteScreen.scrollTop > 5) {
      return;
    }

    e.preventDefault();

    // Normalize wheel delta across trackpads and stepped mice
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32; // lines
    if (e.deltaMode === 2) delta *= 800; // pages

    // Cap delta per tick for smoother control
    const cappedDelta = Math.sign(delta) * Math.min(Math.abs(delta), 120);

    targetProgress += cappedDelta * SCROLL_SENSITIVITY;
    targetProgress = Math.max(0, Math.min(1, targetProgress));

    if (Math.abs(cappedDelta) > 15 && targetProgress > 0.02 && targetProgress < 0.98) {
      playCreakSound();
    }
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (['ArrowDown', 'PageDown', 'Space', 'KeyS', 'KeyJ'].includes(e.code)) {
      if (currentProgress >= 0.99 && whiteScreen.scrollTop < whiteScreen.scrollHeight - whiteScreen.clientHeight - 5) {
        return; // Allow page reading
      }
      e.preventDefault();
      initAudio();
      targetProgress = Math.min(1, targetProgress + 0.15);
      playCreakSound();
    } else if (['ArrowUp', 'PageUp', 'KeyW', 'KeyK'].includes(e.code)) {
      if (currentProgress >= 0.99 && whiteScreen.scrollTop > 5) {
        return; // Allow scrolling up inside content
      }
      e.preventDefault();
      initAudio();
      targetProgress = Math.max(0, targetProgress - 0.15);
      playCreakSound();
    } else if (e.code === 'Home') {
      targetProgress = 0;
    } else if (e.code === 'End') {
      targetProgress = 1;
    }
  }

  // Touch gestures (Mobile & Tablet)
  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    initAudio();
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startProgress = targetProgress;
    isDragging = true;
  }

  function handleTouchMove(e) {
    if (!isDragging || e.touches.length !== 1) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = startY - currentY;
    const diffX = startX - currentX;

    // If fully open and reading white screen
    if (currentProgress >= 0.99 && diffY > 0) return;
    if (currentProgress >= 0.99 && diffY < 0 && whiteScreen.scrollTop > 5) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    // Use vertical swipe or horizontal pull to open door
    const dominantDiff = Math.abs(diffY) > Math.abs(diffX) ? diffY : diffX;

    targetProgress = Math.max(0, Math.min(1, startProgress + dominantDiff / (window.innerHeight * 0.65)));

    if (Math.abs(dominantDiff) > 20) {
      playCreakSound();
    }
  }

  function handleTouchEnd() {
    isDragging = false;
  }

  // Mouse Drag on Door Handle or Door Surface
  function handleMouseDown(e) {
    // Only left click
    if (e.button !== 0) return;
    // Don't drag if clicking buttons
    if (e.target.closest('button') || e.target.closest('a')) return;

    initAudio();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startProgress = targetProgress;

    doorHandle.classList.add('depressed');
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    const diffX = startX - e.clientX;
    const diffY = e.clientY - startY;

    // Dragging either left or down opens door
    const pullDistance = diffX * 1.2 + diffY * 0.8;
    targetProgress = Math.max(0, Math.min(1, startProgress + pullDistance / (window.innerWidth * 0.65)));

    if (Math.abs(pullDistance) > 15) {
      playCreakSound();
    }
  }

  function handleMouseUp() {
    isDragging = false;
    doorHandle.classList.remove('depressed');
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  // Render & Animation Loop
  function update() {
    // Smooth linear interpolation (lerp)
    const prev = currentProgress;
    currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;
    velocity = currentProgress - prev;

    if (Math.abs(targetProgress - currentProgress) < 0.0002) {
      currentProgress = targetProgress;
    }

    // Door handle depression at initial unlatch
    if (currentProgress > 0.005 && currentProgress < 0.08) {
      doorHandle.classList.add('depressed');
    } else if (!isDragging) {
      doorHandle.classList.remove('depressed');
    }

    // Audio latch triggers
    if (currentProgress > 0.02 && !hasUnlatched) {
      playLatchSound('open');
      hasUnlatched = true;
      hasLatched = false;
    } else if (currentProgress <= 0.01 && !hasLatched) {
      playLatchSound('close');
      hasLatched = true;
      hasUnlatched = false;
    }

    // 3D Door Rotation Angle
    // Easing curve for realistic door hinge inertia
    const easedProgress = Math.pow(currentProgress, 0.95);
    const doorAngle = easedProgress * MAX_DOOR_ANGLE;

    // Apply 3D transform to door
    door.style.transform = `rotateY(${doorAngle}deg)`;

    // Surface brightness/shading shifts as door turns away from camera
    const faceBrightness = 1 - currentProgress * 0.28;
    door.style.filter = `brightness(${faceBrightness.toFixed(3)})`;

    // Dynamic cast shadow on the white room
    const shadowIntensity = Math.sin(currentProgress * Math.PI * 0.85);
    doorShadow.style.opacity = (shadowIntensity * 0.85).toFixed(3);
    const shadowWidth = Math.max(20, (1 - currentProgress) * 75);
    doorShadow.style.width = `${shadowWidth}%`;

    // White screen reveal classes
    if (currentProgress > 0.08) {
      document.body.classList.add('door-peek');
    } else {
      document.body.classList.remove('door-peek');
    }

    if (currentProgress > 0.85) {
      document.body.classList.add('door-opened');
    } else {
      document.body.classList.remove('door-opened');
    }

    // Scroll Hint fading
    if (currentProgress > 0.04) {
      scrollHint.style.opacity = Math.max(0, 1 - currentProgress * 8).toFixed(2);
      scrollHint.style.pointerEvents = 'none';
    } else {
      scrollHint.style.opacity = '1';
      scrollHint.style.pointerEvents = 'auto';
    }

    // Progress bar fill
    progressBar.style.width = `${(currentProgress * 100).toFixed(1)}%`;

    requestAnimationFrame(update);
  }

  // Click on scroll hint to nudge open
  scrollHint.addEventListener('click', () => {
    initAudio();
    targetProgress = Math.min(1, targetProgress + 0.35);
  });

  // Click on close door hint to smoothly close
  if (closeDoorHint) {
    closeDoorHint.addEventListener('click', () => {
      initAudio();
      targetProgress = 0;
      playCreakSound();
    });
    closeDoorHint.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        initAudio();
        targetProgress = 0;
        playCreakSound();
      }
    });
  }

  // Attach Event Listeners
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown);

  // Touch events
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Mouse drag on door
  door.addEventListener('mousedown', handleMouseDown);

  // Initialize RAF loop
  requestAnimationFrame(update);

})();
