// Initialize Kaboom
kaboom({
    width: 800, // Canvas width
    height: 600, // Canvas height
    background: [0, 0, 0], // Black background (fallback)
});

// Define layers
layers(["bg", "obj", "ui"], "obj");

// Load background image
loadSprite("background", "assets/background.png");

// Game state
let gameState = {
    distance: 1000, // Light-years to home
    fuel: 50,
    food: 50,
    credits: 100,
    gameOver: false
};

// Events
const events = [
    {
        text: "You encounter a derelict ship. Explore or ignore?",
        choices: [
            { text: "Explore", action: () => {
                if (Math.random() > 0.5) {
                    gameState.credits += 50;
                    return "Found valuable tech! +50 credits.";
                } else {
                    gameState.fuel -= 10;
                    return "Trap! Lost 10 fuel.";
                }
            }},
            { text: "Ignore", action: () => "You move on safely." }
        ]
    },
    {
        text: "A trader offers food for credits. Trade or decline?",
        choices: [
            { text: "Trade", action: () => {
                gameState.credits -= 20;
                gameState.food += 20;
                return "Traded 20 credits for 20 food.";
            }},
            { text: "Decline", action: () => "You decline the offer." }
        ]
    }
];

// Add background sprite (scaled to fit canvas)
add([
    sprite("background"),
    pos(0, 0),
    scale(width() / 800, height() / 600), // Adjust based on image size (e.g., 800x600)
    layer("bg"),
    fixed() // Keeps background static
]);

// UI: Status text
const status = add([
    text("", { size: 24, font: "sans-serif" }),
    pos(width() / 2, 50),
    origin("center"),
    layer("ui"),
    fixed()
]);

// UI: Event text
const eventText = add([
    text("", { size: 24, font: "sans-serif" }),
    pos(width() / 2, height() / 2),
    origin("center"),
    layer("ui"),
    fixed()
]);

// Update status
function updateStatus() {
    status.text = `Distance: ${gameState.distance} ly | Fuel: ${gameState.fuel} | Food: ${gameState.food} | Credits: ${gameState.credits}`;
}

// Trigger event
function triggerEvent() {
    if (gameState.gameOver) return;
    const event = events[Math.floor(Math.random() * events.length)];
    eventText.text = event.text;

    // Clear previous buttons
    destroyAll("button");

    // Add choice buttons
    event.choices.forEach((choice, index) => {
        add([
            text(choice.text, { size: 20, font: "sans-serif" }),
            pos(width() / 2, height() / 2 + 50 + index * 40),
            origin("center"),
            layer("ui"),
            area(),
            "button",
            { clickAction: () => {
                const result = choice.action();
                eventText.text = result;
                gameState.distance -= 10;
                gameState.fuel -= 5;
                gameState.food -= 5;

                // Check game over
                if (gameState.fuel <= 0 || gameState.food <= 0) {
                    gameState.gameOver = true;
                    eventText.text = "Game Over: You ran out of resources.";
                    destroyAll("button");
                } else if (gameState.distance <= 0) {
                    gameState.gameOver = true;
                    eventText.text = "You reached home! You win!";
                    destroyAll("button");
                } else {
                    setTimeout(triggerEvent, 1000); // Next event
                }
                updateStatus();
            }}
        ]);
    });
}

// Handle button clicks
onClick("button", (b) => b.clickAction());

// Start game
updateStatus();
triggerEvent();
