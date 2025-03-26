import React, { useRef, useEffect, useState } from 'react';

const Canvas = (props) => {
  const canvasRef = useRef(null);
  const cwidth = 1000;
  const cheight = 800;
  const rows = 50;
  const cubeSize = 20;
  const [alive, setAlive] = useState(new Set());
  const [start, setStart] = useState(false);

  const draw = (ctx, index) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.fillRect((index % rows) * cubeSize, Math.floor(index / rows) * cubeSize, cubeSize, cubeSize); // cube coordinates
    ctx.fill();
  };

  const Extractor = (ctx, frame) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    frame.forEach(i => draw(ctx, i));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.canvas.width = cwidth;
    context.canvas.height = cheight;

    Extractor(context, alive);

    const handleClick = (event) => {
      if (!start) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate the index from coordinates
        const i = Math.floor(x / cubeSize) + (Math.floor(y / cubeSize) * rows);

        const newAlive = new Set(alive);
        if (newAlive.has(i)) {
          newAlive.delete(i);
        } else {
          newAlive.add(i);
        }
        console.log(newAlive)
        setAlive(newAlive);

        Extractor(context, newAlive);
      }
    };

    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [alive, start]);

  useEffect(() => {
    let interval;
    if (start) {
      interval = setInterval(() => {
        let newpos = adjecentCubes(alive);
        setAlive(newpos);
      }, 100);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [start, alive]);

  function adjecentCubes(positions) {
    let newPositions = new Set(positions); 

    positions.forEach((pos) => {
      let emptyCells = [];
      let l = pos - 1;
      let r = pos + 1;
      let d = pos + 50;
      let u = pos - 50;

      // Diagonal positions
      let tl = pos - 51; 
      let tr = pos - 49; 
      let bl = pos + 49;
      let br = pos + 51; 

      let current = [l, r, d, u, tl, tr, bl, br];

      // Identify empty cells
      for (let cell of current) {
        if (!positions.has(cell)) {
          emptyCells.push(cell);
        }
      }

      // Check surrounding cubes for each empty cell
      emptyCells.forEach((ecell) => {
        let count = 0; // Count of surrounding cubes

        if (positions.has(ecell + 1)) count++;
        if (positions.has(ecell - 1)) count++;
        if (positions.has(ecell + 50)) count++;
        if (positions.has(ecell - 50)) count++;

        if (positions.has(ecell - 51)) count++;
        if (positions.has(ecell - 49)) count++;
        if (positions.has(ecell + 49)) count++;
        if (positions.has(ecell + 51)) count++;

        if (count === 3) {
          newPositions.add(ecell);
        }
      });

      let count = 0;

      if (positions.has(l)) count++;
      if (positions.has(r)) count++;
      if (positions.has(u)) count++;
      if (positions.has(d)) count++;

      if (positions.has(tl)) count++;
      if (positions.has(tr)) count++;
      if (positions.has(bl)) count++;
      if (positions.has(br)) count++;

      if (count < 2 || count > 3) {
        newPositions.delete(pos);
      }
    });

    return newPositions; 
  }

  return (
    <div>
      <canvas ref={canvasRef} {...props} />
      <button onClick={() => setStart(prev => !prev)}>
        {start ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};

export default Canvas;
