import kaboom from "kaboom";

kaboom({
    background: [0, 0, 0], // Black space background
});

add([
    text("The Long Road Home", { size: 48 }),
    pos(width() / 2, 50),
    origin("center"),
]);

let distance = 1000;
let fuel = 50;
let food = 50;

const status = add([
    text(`Distance: ${distance} ly | Fuel: ${fuel} | Food: ${food}`, { size: 24 }),
    pos(width() / 2, 150),
    origin("center"),
]);

add([
    text("Event: You see a derelict ship. Explore or ignore?", { size: 24 }),
    pos(width() / 2, 300),
    origin("center"),
]);

add([
    text("Explore", { size: 24 }),
    pos(width() / 2 - 100, 400),
    area(),
    "button",
    { clickAction: () => alert("Explore clicked!") },
]);

add([
    text("Ignore", { size: 24 }),
    pos(width() / 2 + 100, 400),
    area(),
    "button",
    { clickAction: () => alert("Ignore clicked!") },
]);

onClick("button", (b) => b.clickAction());
