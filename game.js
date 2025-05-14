let gameState = {
    distance: 1000, // Light-years to home
    fuel: 50,
    food: 50,
    credits: 100,
    gameOver: false
};

const events = [
    { text: "You encounter a derelict ship. Explore or ignore?", choices: ["explore", "ignore"] },
    { text: "A trader offers food for credits. Trade or decline?", choices: ["trade", "decline"] },
    { text: "Asteroid field ahead. Navigate or detour?", choices: ["navigate", "detour"] }
];

function updateStatus() {
    document.getElementById("status").textContent =
        `Distance to home: ${gameState.distance} light-years. Fuel: ${gameState.fuel}. Food: ${gameState.food}. Credits: ${gameState.credits}.`;
}

function triggerEvent() {
    if (gameState.gameOver) return;
    const event = events[Math.floor(Math.random() * events.length)];
    document.getElementById("event").textContent = event.text;
    // Update buttons dynamically based on event.choices
}

function makeChoice(choice) {
    if (gameState.gameOver) return;

    // Example logic for choices
    if (choice === "explore") {
        if (Math.random() > 0.5) {
            gameState.credits += 50;
            document.getElementById("event").textContent = "Found valuable tech! +50 credits.";
        } else {
            gameState.fuel -= 10;
            document.getElementById("event").textContent = "Trap! Lost 10 fuel.";
        }
    } else if (choice === "ignore") {
        document.getElementById("event").textContent = "You move on safely.";
    }

    // Update resources
    gameState.distance -= 10;
    gameState.fuel -= 5;
    gameState.food -= 5;

    // Check game over
    if (gameState.fuel <= 0 || gameState.food <= 0) {
        gameState.gameOver = true;
        document.getElementById("event").textContent = "Game Over: You ran out of resources.";
    } else if (gameState.distance <= 0) {
        gameState.gameOver = true;
        document.getElementById("event").textContent = "You reached home! You win!";
    }

    updateStatus();
    if (!gameState.gameOver) setTimeout(triggerEvent, 1000); // Next event
}

// Start game
updateStatus();
triggerEvent();
