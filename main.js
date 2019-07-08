var interval;

// Tocca setup
window.tocca({
  swipeThreshold: 40,
})

// Setup a new signed snake game by calling snake
// engine API. Documentation available at:
// https://github.com/tomarrell/snake/tree/master/validator
const fetchNewGame = (width, height, snake) => {
  const data = {
    width,
    height,
    snake: {
      boundX: width,
      boundY: height,
      velX: snake.velX,
      velY: snake.velY,
      parts: snake.parts,
    }
  };

  return fetch("http://localhost:8081/new", {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => res.json());
}

// Send a validation request with the collected ticks
// since last validation.
const validateTicks = (lastValidState, ticks) => {
  const data = {
    ...lastValidState,
    ticks,
  };

  return fetch("http://localhost:8081/validate", {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => {
    if (res.status != 200) {
      return res.text()
        .then(text => ({ err: text }));
    }
    return res.json();
  });
}

// Setup and main loop
const main = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const xScale = 20;
  const yScale = 20;
  const gridWidth = Math.floor(width / xScale);
  const gridHeight = Math.floor(height / yScale);
  const tickRate = 10;

  var lastValidState = {};
  const ticks = [];

  // Colors
  const snakeColor = "white";
  const canvasColor = "#111";

  // Setup + redering
  const c = document.getElementById("snakeCanvas");
  const ctx = c.getContext("2d");
  var playing = false;
  c.width = width;
  c.height = height;

  // Initial DOM State
  document.querySelectorAll(".gameOver").forEach(e => e.style.opacity = 0);

  var score = 0;
  const renderScore = () => {
    document.querySelector(".score").innerHTML = score;
  }

  // Hide UI elements on game start
  const startPlay = (fn) => (...params) => {
    if (!playing) {
      document.querySelector(".arrowKeys").style.opacity = 0;
      document.querySelector(".scoreWrap").style.opacity = 1;
      playing = true;
      fetchNewGame(gridWidth, gridHeight, snake)
        .then(game => {
          lastValidState = game;
          fruit.fruits = game.fruit;
        });
    }
    fn(...params);
  }

  const stopGame = () => {
    clearInterval(interval);
    document.querySelectorAll(".gameOver").forEach(e => e.style.opacity = 1);
  }

  // Generate a number up to, but not including, max
  const randInt = max => {
    return Math.floor(Math.random() * (max - 0)) + 0;
  };

  const snake = {
    velX: 1,
    velY: 0,
    locked: false,
    parts: [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 1 }],
    up: () => {
      if (snake.velY == 0 && !snake.locked) {
        snake.velX = 0;
        snake.velY = -1;
        snake.locked = true;
      }
    },
    down: () => {
      if (snake.velY == 0 && !snake.locked) {
        snake.velX = 0;
        snake.velY = 1;
        snake.locked = true;
      }
    },
    left: () => {
      if (snake.velX == 0 && !snake.locked) {
        snake.velX = -1;
        snake.velY = 0;
        snake.locked = true;
      }
    },
    right: () => {
      if (snake.velX == 0 && !snake.locked) {
        snake.velX = 1;
        snake.velY = 0;
        snake.locked = true;
      }
    },
    update: () => {
      const newHead = { ...snake.parts[0] };
      snake.locked = false;

      if (playing) {
        ticks.push({ velX: snake.velX, velY: snake.velY });
      }

      newHead.x += snake.velX;
      newHead.y += snake.velY;

      if (newHead.x < 0) {
        newHead.x = gridWidth - 1;
      } else if (newHead.x >= gridWidth) {
        newHead.x = 0;
      } else if (newHead.y < 0) {
        newHead.y = gridHeight - 1;
      } else if (newHead.y >= gridHeight) {
        newHead.y = 0;
      }

      snake.parts = [newHead, ...snake.parts.slice(0, -1)];
    },
    render: (xScale, yScale) => {
      for (part of snake.parts) {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(part.x * xScale, part.y * yScale, xScale, yScale);
      }
    }
  };

  const fruit = {
    fruits: [],
    render: (xScale, yScale) => {
      for (f of fruit.fruits) {
        switch (f.value) {
          case 1:
            ctx.fillStyle = "purple";
            break;
          case 2:
            ctx.fillStyle = "orange";
            break;
          case 5:
            ctx.fillStyle = "green";
            break;
        }
        ctx.fillRect(f.x * xScale, f.y * yScale, xScale, yScale);
      }
    }
  };

  const handleValidation = () => {
    validateTicks(lastValidState, ticks)
      .then(res => {
        if (res.err) {
          throw new Error(res.err);
        }
        lastValidState = { ...res };
        fruit.fruits = res.fruit;
      });
  }

  const checkFruitCollision = () => {
    for (const [i, f] of fruit.fruits.entries()) {
      const head = snake.parts[0];
      const tail = snake.parts[snake.parts.length - 1];

      if (head.x === f.x && head.y === f.y) {
        score += f.value;
        snake.parts.push(...Array(f.value).fill(tail));

        handleValidation();

        ticks.length = 0; // Start tick collection from scratch
        fruit.fruits[i] = {}; // remove collided fruit
      }
    }
  };

  const checkSelfCollision = () => {
    head = snake.parts[0]
    for (part of snake.parts.slice(1)) {
      if (head.x == part.x && head.y == part.y) {
        stopGame();
      }
    }
  }

  // Clear canvas
  const clear = () => {
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, c.width, c.height);
  };

  // Main render func
  const render = () => {
    clear();

    snake.update();
    checkFruitCollision();
    checkSelfCollision();

    snake.render(xScale, yScale);
    fruit.render(xScale, yScale);

    if (playing) {
      renderScore();
    }
  };

  window.addEventListener("keydown", startPlay(e => {
    if (e.keyCode == 37) {
      snake.left();
    } else if (e.keyCode == 38) {
      snake.up();
    } else if (e.keyCode == 39) {
      snake.right();
    } else if (e.keyCode == 40) {
      snake.down();
    }
  }));

  // Swipe functionality
  window.addEventListener('swipeleft',  startPlay(() => snake.left()));
  window.addEventListener('swiperight', startPlay(() => snake.right()));
  window.addEventListener('swipeup',    startPlay(() => snake.up()));
  window.addEventListener('swipedown',  startPlay(() => snake.down()));

  return setInterval(() => {
    render();
  }, 100);
}

interval = main();

const newGame = () => {
  clearInterval(interval);
  interval = main();
}

window.onresize = () => {
  clearInterval(interval);
  interval = main();
}

document.querySelectorAll(".restart").forEach(e => e.addEventListener("click", newGame));
