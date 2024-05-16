import type { GameDocs } from '../../types';

export function setupCanvas({ canvas, chatMessages }: GameDocs) {
  // Gets the canvas
  const ctx = canvas.getContext('2d', {
    alpha: false,
  }) as CanvasRenderingContext2D;

  // Handles resizing
  resize();
  window.onresize = resize;

  // Handles drawing
  draw();

  function draw() {
    ctx.clearRect(0, 0, 1920, 1080);

    ctx.fillStyle = 'white';
    ctx.fillRect(100, 100, 75, 75);

    requestAnimationFrame(draw);
  }

  function resize() {
    // Fix chat messages scrollbar
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Resize canvas
    const scale = Math.min(
      (window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth) ||
        0) / 1920,
      (window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight) ||
        0) / 1080,
    );

    canvas.width = 1920 * scale;
    canvas.height = 1080 * scale;

    ctx.scale(scale, scale);
  }
}
