document.addEventListener('DOMContentLoaded', () => {
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
        localStorage.setItem('gameState', JSON.stringify(gameState));
        console.log('Game state saved');
    }
    function loadGame() {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            gameState = JSON.parse(saved);
            console.log('Game state loaded');
            updateStatus();
        }
    }
    loadGame();

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

    // DOM elements
    const eventText = document.getElementById('event-text');
    const choicesDiv = document.getElementById('choices');
    const distanceSpan = document.getElementById('distance');
    const fuelSpan = document.getElementById('fuel');
    const foodSpan = document.getElementById('food');
    const creditsSpan = document.getElementById('credits');

    function updateStatus() {
        distanceSpan.textContent = gameState.distance;
        fuelSpan.textContent = gameState.fuel;
        foodSpan.textContent = gameState.food;
        creditsSpan.textContent = gameState.credits;
        console.log('Status updated:', gameState);
    }

    function triggerEvent() {
        if (gameState.gameOver) {
            eventText.textContent = gameState.distance <= 0 ? "You reached Mars! You win!" : "Game Over: You ran out of resources.";
            const restartButton = document.createElement('button');
            restartButton.className = 'choice-button';
            restartButton.textContent = 'Restart';
            restartButton.onclick = () => {
                gameState = { distance: 1000, fuel: 100, food: 100, credits: 100, gameOver: false };
                updateStatus();
                triggerEvent();
                saveGame();
            };
            choicesDiv.innerHTML = '';
            choicesDiv.appendChild(restartButton);
            console.log('Game over, restart button added');
            return;
        }

        const event = events[Math.floor(Math.random() * events.length)];
        eventText.textContent = event.text;
        choicesDiv.innerHTML = '';

        event.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.onclick = () => {
                const result = choice.action();
                eventText.textContent = result;
                gameState.distance -= 5;
                gameState.fuel -= 3;
                gameState.food -= 3;

                if (gameState.fuel <= 0 || gameState.food <= 0) {
                    gameState.gameOver = true;
                } else if (gameState.distance <= 0) {
                    gameState.gameOver = true;
                }

                updateStatus();
                saveGame();

                if (!gameState.gameOver) {
                    setTimeout(triggerEvent, 1000);
                } else {
                    triggerEvent(); // Show game over
                }
                console.log('Choice made:', choice.text, 'Result:', result);
            };
            choicesDiv.appendChild(button);
        });
        console.log('Event triggered:', event.text);
    }

    // Start game
    updateStatus();
    triggerEvent();
    console.log('Game started');
});
