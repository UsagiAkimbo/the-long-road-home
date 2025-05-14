// Initialize Kaboom
kaboom({
    width: 800,
    height: 600,
    background: [0, 0, 0]
});

// Define layers
layers(["bg", "obj", "ui"], "obj");

// Load assets
loadFont("roboto", "assets/roboto.ttf", {
    error: () => console.error("Failed to load font: assets/roboto.ttf")
});
loadSprite("background", "assets/background.jpg", {
    error: () => console.error("Failed to load background image")
});

// Add background
add([
    sprite("background"),
    pos(0, 0),
    scale(width() / 800, height() / 600),
    layer("bg"),
    fixed()
]);

// Game state
let gameState = {
    distance: 1000, // Arbitrary units (Earth to Mars)
    fuel: 50,
    food: 50,
    credits: 100,
    gameOver: false
};

// Events
const events = [
    {
        text: "A solar flare threatens electronics. Shield systems or divert course?",
        choices: [
            { text: "Shield", action: () => {
                gameState.credits -= 20;
                return Math.random() < 0.7 ? "Electronics protected!" : (gameState.fuel -= 10, "Shields fail! -10 fuel.");
            }},
            { text: "Divert", action: () => {
                gameState.fuel -= 15;
                return "Safe detour, fuel dips.";
            }}
        ]
    },
    {
        text: "Meteor shower ahead. Navigate through or wait it out?",
        choices: [
            { text: "Navigate", action: () => {
                return Math.random() < 0.6 ? "Skillful piloting!" : (gameState.credits -= 15, "Hull hit! -15 credits.");
            }},
            { text: "Wait", action: () => {
                gameState.distance += 10;
                return "Safe, but you lose time.";
            }}
        ]
    },
    {
        text: "Food spoilage detected. Ration supplies or buy replacements?",
        choices: [
            { text: "Ration", action: () => {
                gameState.food -= 10;
                return "Family grumbles but survives.";
            }},
            { text: "Buy", action: () => {
                gameState.credits -= 20;
                gameState.food += 15;
                return "Fresh supplies secured.";
            }}
        ]
    },
    {
        text: "Distress signal nearby. Help them or continue?",
        choices: [
            { text: "Help", action: () => {
                gameState.fuel -= 10;
                gameState.food -= 10;
                return Math.random() < 0.5 ? (gameState.credits += 20, "They share tech! +20 credits.") : "No reward, just thanks.";
            }},
            { text: "Continue", action: () => "You move on, guilt lingering." }
        ]
    },
    {
        text: "Engine overheating. Vent heat or reduce speed?",
        choices: [
            { text: "Vent", action: () => {
                gameState.fuel -= 10;
                return "Engine stabilized.";
            }},
            { text: "Reduce", action: () => {
                gameState.distance += 10;
                return "Safe, but progress slows.";
            }}
        ]
    },
    {
        text: "Space debris blocks path. Blast it or maneuver?",
        choices: [
            { text: "Blast", action: () => {
                gameState.fuel -= 15;
                return "Path cleared!";
            }},
            { text: "Maneuver", action: () => {
                return Math.random() < 0.8 ? "Smooth sailing!" : (gameState.credits -= 10, "Minor scrape. -10 credits.");
            }}
        ]
    },
    {
        text: "Family member ill. Use supplies or seek clinic?",
        choices: [
            { text: "Supplies", action: () => {
                gameState.credits -= 15;
                return "They recover fully.";
            }},
            { text: "Clinic", action: () => {
                gameState.distance += 15;
                gameState.credits -= 10;
                return "Professional care succeeds.";
            }}
        ]
    },
    {
        text: "Pirates demand credits. Pay or fight?",
        choices: [
            { text: "Pay", action: () => {
                gameState.credits -= 25;
                return "Pirates leave you alone.";
            }},
            { text: "Fight", action: () => {
                return Math.random() < 0.6 ? (gameState.credits += 10, "Pirates retreat! +10 credits.") : (gameState.fuel -= 15, "Damage taken! -15 fuel.");
            }}
        ]
    },
    {
        text: "Fuel leak detected. Patch or conserve?",
        choices: [
            { text: "Patch", action: () => {
                gameState.credits -= 15;
                return "Leak fixed, fuel saved.";
            }},
            { text: "Conserve", action: () => {
                gameState.distance += 10;
                gameState.fuel -= 5;
                return "Leak persists but manageable.";
            }}
        ]
    },
    {
        text: "Trader offers food for credits. Trade or decline?",
        choices: [
            { text: "Trade", action: () => {
                gameState.credits -= 20;
                gameState.food += 20;
                return "Pantry restocked!";
            }},
            { text: "Decline", action: () => "You pass on the offer." }
        ]
    }
];

// HUD: UI
const status = add([
    text("", { size: 20, font: "roboto" }),
    pos(20, 70),
    origin("topleft"),
    layer("ui"),
    fixed()
]);

const eventText = add([
    text("", { size: 24, font: "roboto" }),
    pos(width() / 2, height() / 2 - 50),
    origin("center"),
    layer("ui"),
    fixed()
]);

function updateStatus() {
    status.text = `Distance: ${gameState.distance} | Fuel: ${gameState.fuel} | Food: ${gameState.food} | Credits: ${gameState.credits}`;
}

function triggerEvent() {
    if (gameState.gameOver) return;
    const event = events[Math.floor(Math.random() * events.length)];
    eventText.text = event.text;

    destroyAll("button");

    event.choices.forEach((choice, index) => {
        add([
            text(choice.text, { size: 20, font: "roboto" }),
            pos(width() / 2, height() / 2 + 20 + index * 40),
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

                if (gameState.fuel <= 0 || gameState.food <= 0) {
                    gameState.gameOver = true;
                    eventText.text = "Game Over: You ran out of resources.";
                    destroyAll("button");
                } else if (gameState.distance <= 0) {
                    gameState.gameOver = true;
                    eventText.text = "You reached Mars! You win!";
                    destroyAll("button");
                } else {
                    setTimeout(triggerEvent, 1000);
                }
                updateStatus();
            }}
        ]);
    });
}

onClick("button", (b) => b.clickAction());

// Start game
updateStatus();
triggerEvent();
