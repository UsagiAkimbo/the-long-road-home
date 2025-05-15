// Initialize Kaboom
try {
    kaboom({
        width: window.innerWidth,
        height: window.innerHeight,
        background: [0, 0, 0], // Retro green (#55FF55)
        stretch: true,
        letterbox: true
    });
    console.log("Kaboom initialized successfully");
} catch (err) {
    console.error("Kaboom initialization failed:", err);
}

// Define layers
try {
    layers(["bg", "obj", "ui"], "obj");
    console.log("Layers defined successfully");
} catch (err) {
    console.error("Layers failed:", err);
}

// Font preloading
let fontLoaded = false;
try {
    const font = new FontFace("vt323", "url(assets/VT323-Regular.ttf)");
    font.load().then(() => {
        document.fonts.add(font);
        fontLoaded = true;
        console.log("VT323 font preloaded successfully");
    }).catch(err => console.error("FontFace preload failed:", err));
} catch (err) {
    console.error("FontFace setup failed:", err);
}

// Load assets and initialize game
try {
    loadSprite("boxImage", "assets/space-00.jpg", {
        error: () => console.error("Failed to load image: assets/space-00.jpg")
    });
    loadSprite("ship", "assets/starship.jpg", {
        error: () => console.error("Failed to load image: assets/starship.jpg")
    });
    console.log("Sprite loading initiated for boxImage and ship");

    // Wait for all assets to load
    onLoad(() => {
        console.log("All assets loaded successfully");

        // Force initial render
        requestAnimationFrame(() => {
            console.log("Initial render triggered");
        });

        // Add image box (800x400, rounded)
        add([
            sprite("boxImage"),
            pos(width() / 2 - 400, height() / 2 - 200),
            scale(1),
            layer("bg"),
            fixed()
        ]);
        add([
            rect(800, 400, { radius: 20 }),
            pos(width() / 2 - 400, height() / 2 - 200),
            color(0, 0, 0, 0),
            outline(4, [85, 255, 85]),
            layer("bg"),
            fixed()
        ]);
        console.log("Image box added successfully");

        // Add ship sprite
        add([
            sprite("ship"),
            pos(100, 500),
            scale(0.5),
            layer("obj")
        ]);
        console.log("Ship sprite added successfully");

        // Game state
        let gameState = {
            distance: 1000,
            fuel: 100,
            food: 100,
            credits: 100,
            gameOver: false
        };

        // Save/Load
        function saveGame() {
            localStorage.setItem("gameState", JSON.stringify(gameState));
            console.log("Game state saved");
        }
        function loadGame() {
            const saved = localStorage.getItem("gameState");
            if (saved) {
                gameState = JSON.parse(saved);
                console.log("Game state loaded");
            }
        }
        loadGame(); // Load saved state on start

        // HUD: UI
        const fontName = fontLoaded ? "vt323" : "apl386"; // Fallback
        add([
            rect(350, 60),
            pos(20, 100),
            color(0, 0, 0, 0.7),
            layer("ui"),
            fixed()
        ]);
        add([
            text("The Long Road Home", { size: 48, font: fontName }),
            pos(width() / 2, 50),
            origin("center"),
            layer("ui"),
            fixed()
        ]);
        add([
            rect(300, 60),
            pos(15, 65),
            color(0, 0, 0, 0.7),
            origin("topleft"),
            layer("ui"),
            fixed()
        ]);
        const status = add([
            text("", { size: 24, font: fontName }),
            pos(25, 105),
            origin("topleft"),
            layer("ui"),
            fixed()
        ]);
        add([
            rect(600, 200),
            pos(width() / 2 - 300, height() / 2 - 100),
            color(0, 0, 0, 0.7),
            origin("center"),
            layer("ui"),
            fixed()
        ]);
        const eventText = add([
            text("", { size: 32, font: fontName }),
            pos(width() / 2, height() / 2 - 50),
            origin("center"),
            layer("ui"),
            fixed()
        ]);

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

        function updateStatus() {
            status.text = `Distance: ${gameState.distance} | Fuel: ${gameState.fuel} | Food: ${gameState.food} | Credits: ${gameState.credits}`;
        }

        function triggerEvent() {
            if (gameState.gameOver) {
                add([
                    text("Restart", { size: 20, font: fontName }),
                    pos(width() / 2, height() / 2 + 100),
                    origin("center"),
                    layer("ui"),
                    area(),
                    "restart",
                    { clickAction: () => {
                        gameState = { distance: 1000, fuel: 100, food: 100, credits: 100, gameOver: false };
                        updateStatus();
                        triggerEvent();
                    }}
                ]);
            }
            const event = events[Math.floor(Math.random() * events.length)];
            eventText.text = event.text;

            destroyAll("button");

            event.choices.forEach((choice, index) => {
                add([
                    text(choice.text, { size: 24, font: fontName }),
                    pos(width() / 2, height() / 2 + 20 + index * 40),
                    origin("center"),
                    layer("ui"),
                    area(),
                    "button",
                    { clickAction: () => {
                        const result = choice.action();
                        eventText.text = result;
                        gameState.distance -= 5;
                        gameState.fuel -= 3;
                        gameState.food -= 3;

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
                        saveGame(); // Save state after each event
                    }}
                ]);
            });
        }

        onClick("button", (b) => b.clickAction());
        onClick("restart", (b) => b.clickAction());

        // Start game
        updateStatus();
        triggerEvent();
    });
} catch (err) {
    console.error("Game initialization failed:", err);
}
