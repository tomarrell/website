// Settings
const width = window.innerWidth;
const height = window.innerHeight;
const gridWidth = width / 20;
const gridHeight = height / 20;
const tickRate = 100;

// Colors
const snakeColor = "white";
const canvasColor = "#111";

// Setup + redering
const c = document.getElementById("snakeCanvas");
const ctx = c.getContext("2d");
c.width = width;
c.height = height;

const clear = () => {
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0, 0, c.width, c.height);
}

const renderSnake = (xScale, yScale, snake) => {
  for (part of snake.parts) {
    ctx.fillStyle = snakeColor;
    ctx.fillRect(part.x * xScale, part.y * yScale, xScale, yScale);
  }
}

const renderFruit = (xScale, yScale, fruits) => {
  for (fruit of fruits) {
    switch (fruit.value) {
      case 1:
        ctx.fillStyle = "pink";
        break;
      case 2:
        ctx.fillStyle = "orange";
        break;
      case 5:
        ctx.fillStyle = "green";
        break;
    }
    ctx.fillRect(fruit.x * xScale, fruit.y * yScale, xScale, yScale);
  }
}

const renderScore = (score) => {
  document.getElementById("score").innerHTML = score;
}

const renderState = (state) => {
  const xScale = Math.floor(width / state.width);
  const yScale = Math.floor(height / state.height);

  clear()
  renderSnake(xScale, yScale, state.snake);
  renderFruit(xScale, yScale, state.fruit);
  renderScore(state.score)
}

//-----------
// Websocket
//-----------
const host = window.location.hostname + ":3000";
const ws = new WebSocket("ws://" + host + "/ws");

document.body.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 38:
      ws.send(JSON.stringify({ type: "input", direction: "up" }));
      break;
    case 37:
      ws.send(JSON.stringify({ type: "input", direction: "left" }));
      break;
    case 40:
      ws.send(JSON.stringify({ type: "input", direction: "down" }));
      break;
    case 39:
      ws.send(JSON.stringify({ type: "input", direction: "right" }));
      break;
  }
})

ws.onmessage = (e) => {
  const payload = JSON.parse(e.data);
  if (payload.type === "state") {
    renderState(payload.data)
  }
}

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "new", width: gridWidth, height: gridHeight, tick: tickRate }));
}
