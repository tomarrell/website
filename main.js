// Settings
const width = window.innerWidth;
const height = window.innerHeight;
const xScale = 20;
const yScale = 20;
const gridWidth = Math.floor(width / xScale);
const gridHeight = Math.floor(height / yScale);
const tickRate = 10;

// Colors
const snakeColor = "white";
const canvasColor = "#111";

// Setup + redering
const c = document.getElementById("snakeCanvas");
const ctx = c.getContext("2d");
c.width = width;
c.height = height;

const randInt = (max) => {
	return Math.floor(Math.random() * (max - 0)) + 0;
}

const generateFruit = () => {
	const fruitValSeed = randInt(10);
	var f = 0;

	if (fruitValSeed < 5) {
		f = 1
	} else if (fruitValSeed < 8) {
		f = 2
	} else {
		f = 5
	}

	return {
		x: randInt(gridWidth),
		y: randInt(gridHeight),
		value: f,
	}
}

var score = 0;

const snake = {
  velX: 1,
  velY: 0,
  parts: [
    { x: 3, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 1 },
  ],
	up: () => {
		snake.velX = 0;
		snake.velY = -1;
	},
	down: () => {
		snake.velX = 0;
		snake.velY = 1;
	},
	left: () => {
		snake.velX = -1;
		snake.velY = 0;
	},
	right: () => {
		snake.velX = 1;
		snake.velY = 0;
	},
	update: () => {
		const newHead = { ...snake.parts[0] };

		newHead.x += snake.velX
		newHead.y += snake.velY

		if (newHead.x < 0) {
			newHead.x = gridWidth
		} else if (newHead.x > gridWidth) {
			newHead.x = 0
		} else if (newHead.y < 0) {
			newHead.y = gridHeight
		} else if (newHead.y > gridHeight) {
			newHead.y = 0
		}

		snake.parts = [newHead, ...snake.parts.slice(0, -1)];
	},
	render: (xScale, yScale) => {
		for (part of snake.parts) {
			ctx.fillStyle = snakeColor;
			ctx.fillRect(part.x * xScale, part.y * yScale, xScale, yScale);
		}
	}
}

const fruit = {
	fruits: [generateFruit(), generateFruit()],
	render: (xScale, yScale) => {
		for (f of fruit.fruits) {
			switch (f.value) {
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
			ctx.fillRect(f.x * xScale, f.y * yScale, xScale, yScale);
		}
	}
}

const checkCollision = () => {
	for (const [i, f] of fruit.fruits.entries()) {
		const head = snake.parts[0];
		if (head.x === f.x && head.y === f.y) {
			const last = snake.parts[snake.parts.length-1];
			snake.parts.push(...Array(f.value).fill(last));
			score += f.value;
			fruit.fruits[i] = generateFruit();
		}
	}
}

const clear = () => {
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0, 0, c.width, c.height);
}

const render = () => {
  clear()
	snake.update();
	checkCollision();
  snake.render(xScale, yScale);
  fruit.render(xScale, yScale);
}

currentInterval = setInterval(function() {
	render();
}, 100);

window.addEventListener("keydown", e => {
	if (e.keyCode == 37) {
		snake.left()
	} else if (e.keyCode == 38) {
		snake.up()
	} else if (e.keyCode == 39) {
		snake.right()
	} else if (e.keyCode == 40) {
		snake.down()
	}
})
