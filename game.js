document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let gameState = {
        distance: 2250, // 225 million km, scaled
        fuel: 960, // 960 tons, scaled
        food: 600, // Default for family of 4
        credits: 100,
        gameOver: false,
        familySize: 4,
        crew: [] // Array of {name, conditions, mood}
    };

    // xAI-generated crew names
    const crewNames = [
        'Zara Klyne', 'Torin Vex', 'Elara Syn', 'Kael Dracon', 'Nova Quill',
        'Jaxon Holt', 'Selene Vox', 'Ryn Solaris', 'Aria Zenith', 'Cassian Flux',
        'Lyra Nexis', 'Dax Orion', 'Mira Celest', 'Soren Kade', 'Veda Starling',
        'Zane Pulsar', 'Taryn Eclipse', 'Lila Cosmo', 'Finn Graviton', 'Esme Lumen'
    ];

    // Randomize crew
    function randomizeCrew() {
        gameState.familySize = Math.floor(Math.random() * 3) + 4; // 4–6
        gameState.food = gameState.familySize * 150; // 150 kg/person
        gameState.crew = [];
        const shuffledNames = crewNames.sort(() => Math.random() - 0.5);
        for (let i = 0; i < gameState.familySize; i++) {
            gameState.crew.push({
                name: shuffledNames[i],
                conditions: [], // sick, injured, disabled, starving, distraught
                mood: 'content' // happy, content, accepting, disgruntled, unhappy
            });
        }
        console.log(`Crew initialized: ${gameState.familySize} members`, gameState.crew);
    }

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
            updateCrew();
        } else {
            randomizeCrew();
        }
    }

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
                    gameState.crew.forEach(member => {
                        if (Math.random() < 0.3) member.mood = 'disgruntled';
                    });
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
                    return Math.random() < 0.8 ? "Smooth sailing!" : (gameState.credits -= 10, "Hull scraped! -10 credits.");
                }}
            ]
        },
        {
            text: "Family member ill. Use supplies or seek clinic?",
            choices: [
                { text: "Supplies", action: () => {
                    gameState.credits -= 15;
                    const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                    member.conditions = member.conditions.filter(c => c !== 'sick');
                    return "They recover fully.";
                }},
                { text: "Clinic", action: () => {
                    gameState.distance += 15;
                    gameState.credits -= 10;
                    const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                    member.conditions = member.conditions.filter(c => c !== 'sick');
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
                    if (Math.random() < 0.6) {
                        gameState.credits += 10;
                        return "Pirates retreat! +10 credits.";
                    } else {
                        gameState.fuel -= 15;
                        const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                        if (!member.conditions.includes('injured')) member.conditions.push('injured');
                        return "Damage taken! -15 fuel.";
                    }
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
        },
        {
            text: "Radiation leak in quarters. Seal area or evacuate?",
            choices: [
                { text: "Seal Area", action: () => {
                    gameState.credits -= 15;
                    return "Leak contained.";
                }},
                { text: "Evacuate", action: () => {
                    gameState.distance += 10;
                    return "Crew safe, but progress slows.";
                }}
            ]
        },
        {
            text: "Navigation error detected. Recalibrate or burn extra fuel?",
            choices: [
                { text: "Recalibrate", action: () => {
                    gameState.credits -= 10;
                    return Math.random() < 0.8 ? "Course corrected." : (gameState.distance += 5, "Minor delay.");
                }},
                { text: "Burn Fuel", action: () => {
                    gameState.fuel -= 15;
                    return "Back on track.";
                }}
            ]
        },
        {
            text: "Oxygen filter fails. Replace it or ration air?",
            choices: [
                { text: "Replace", action: () => {
                    gameState.credits -= 20;
                    return "Breathing restored.";
                }},
                { text: "Ration", action: () => {
                    gameState.food -= 5;
                    gameState.crew.forEach(member => {
                        if (Math.random() < 0.3) member.mood = 'unhappy';
                    });
                    return "Crew manages, but morale dips.";
                }}
            ]
        },
        {
            text: "Solar panel malfunctions. Repair or divert fuel?",
            choices: [
                { text: "Repair", action: () => {
                    gameState.credits -= 15;
                    return "Power restored.";
                }},
                { text: "Divert Fuel", action: () => {
                    gameState.fuel -= 10;
                    return "Backup power online.";
                }}
            ]
        },
        {
            text: "Communication blackout with Earth. Boost signal or wait?",
            choices: [
                { text: "Boost Signal", action: () => {
                    gameState.fuel -= 10;
                    return "Contact restored.";
                }},
                { text: "Wait", action: () => {
                    gameState.distance += 10;
                    return "Signal returns, but delayed.";
                }}
            ]
        },
        {
            text: "Crew conflict escalates. Mediate or let it resolve?",
            choices: [
                { text: "Mediate", action: () => {
                    gameState.food -= 10;
                    gameState.crew.forEach(member => {
                        if (Math.random() < 0.5) member.mood = 'content';
                    });
                    return "Harmony restored.";
                }},
                { text: "Let Resolve", action: () => {
                    if (Math.random() < 0.6) {
                        return "Crew works it out.";
                    } else {
                        gameState.credits -= 5;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.3) member.mood = 'disgruntled';
                        });
                        return "Morale suffers. -5 credits.";
                    }
                }}
            ]
        },
        {
            text: "Micrometeorite damages hull. Patch now or later?",
            choices: [
                { text: "Patch Now", action: () => {
                    gameState.credits -= 20;
                    return "Hull secured.";
                }},
                { text: "Patch Later", action: () => {
                    return Math.random() < 0.7 ? "No further damage." : (gameState.fuel -= 10, "Fuel leaks. -10 fuel.");
                }}
            ]
        },
        {
            text: "Water recycler jams. Fix or ration water?",
            choices: [
                { text: "Fix", action: () => {
                    gameState.credits -= 15;
                    return "Water supply restored.";
                }},
                { text: "Ration", action: () => {
                    gameState.food -= 5;
                    gameState.crew.forEach(member => {
                        if (Math.random() < 0.3) member.mood = 'unhappy';
                    });
                    return "Crew copes, but unhappy.";
                }}
            ]
        },
        {
            text: "Rare cosmic phenomenon detected. Study or stay on course?",
            choices: [
                { text: "Study", action: () => {
                    gameState.distance += 10;
                    return Math.random() < 0.5 ? (gameState.credits += 20, "Data sold! +20 credits.") : "No usable data.";
                }},
                { text: "Stay on Course", action: () => "Progress continues." }
            ]
        },
        {
            text: "Power surge threatens systems. Shut down or reroute?",
            choices: [
                { text: "Shut Down", action: () => {
                    gameState.distance += 10;
                    return "Systems safe.";
                }},
                { text: "Reroute", action: () => {
                    gameState.fuel -= 15;
                    return "Power stabilized.";
                }}
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
    const familySpan = document.getElementById('family');
    const crewList = document.getElementById('crew-list');

    function updateStatus() {
        distanceSpan.textContent = gameState.distance;
        fuelSpan.textContent = gameState.fuel.toFixed(1);
        foodSpan.textContent = gameState.food.toFixed(1);
        creditsSpan.textContent = gameState.credits;
        familySpan.textContent = gameState.familySize;

        // Update status list
        statusList.innerHTML = `
            <div class="status-item">Distance: ${gameState.distance} M km</div>
            <div class="status-item">Fuel: ${gameState.fuel.toFixed(1)} tons</div>
            <div class="status-item">Food: ${gameState.food.toFixed(1)} kg</div>
            <div class="status-item">Credits: ${gameState.credits}</div>
            <div class="status-item">Family: ${gameState.familySize}</div>
        `;
        console.log('Status updated:', gameState);
    }

    function updateCrew() {
        crewList.innerHTML = '';
        gameState.crew.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'crew-member';
            memberDiv.innerHTML = `
                <span>${member.name}</span>
                ${member.conditions.includes('sick') ? '<img src="assets/sick.png" class="condition-icon" alt="Sick">' : ''}
                ${member.conditions.includes('injured') ? '<img src="assets/injured.png" class="condition-icon" alt="Injured">' : ''}
                ${member.conditions.includes('disabled') ? '<img src="assets/disabled.png" class="condition-icon" alt="Disabled">' : ''}
                ${member.conditions.includes('starving') ? '<img src="assets/starving.png" class="condition-icon" alt="Starving">' : ''}
                ${member.conditions.includes('distraught') ? '<img src="assets/distraught.png" class="condition-icon" alt="Distraught">' : ''}
                <img src="assets/${member.mood}.png" class="mood-icon" alt="${member.mood}">
            `;
            crewList.appendChild(memberDiv);
        });
        console.log('Crew updated:', gameState.crew);
    }

    function updateConditionsAndMood() {
        gameState.crew.forEach(member => {
            // Starving condition
            if (gameState.food <= 0 && !member.conditions.includes('starving')) {
                member.conditions.push('starving');
                member.mood = 'unhappy';
            } else if (gameState.food > 0 && member.conditions.includes('starving')) {
                member.conditions = member.conditions.filter(c => c !== 'starving');
            }
            // Mood adjustments
            if (gameState.food < 100 || member.conditions.length > 0) {
                if (member.mood === 'happy' || member.mood === 'content') {
                    member.mood = 'accepting';
                } else if (member.mood === 'accepting') {
                    member.mood = 'disgruntled';
                }
            } else if (gameState.food > 300 && member.conditions.length === 0) {
                if (member.mood === 'disgruntled' || member.mood === 'unhappy') {
                    member.mood = 'accepting';
                } else if (member.mood === 'accepting') {
                    member.mood = 'content';
                } else if (member.mood === 'content' && Math.random() < 0.1) {
                    member.mood = 'happy';
                }
            }
        });
        updateCrew();
    }

    function triggerEvent() {
        if (gameState.gameOver) {
            eventText.textContent = gameState.distance <= 0 ? "You reached Mars! You win!" : "Game Over: You ran out of resources.";
            const restartButton = document.createElement('button');
            restartButton.className = 'choice-button';
            restartButton.textContent = 'Restart';
            restartButton.onclick = () => {
                gameState = {
                    distance: 2250,
                    fuel: 960,
                    food: gameState.familySize * 150,
                    credits: 100,
                    gameOver: false,
                    familySize: gameState.familySize,
                    crew: gameState.crew.map(member => ({
                        name: member.name,
                        conditions: [],
                        mood: 'content'
                    }))
                };
                updateStatus();
                updateCrew();
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
                gameState.distance -= 10;
                gameState.fuel -= 4;
                let foodDecrement = gameState.familySize * 0.67;
                gameState.crew.forEach(member => {
                    if (member.conditions.length > 0) foodDecrement += 0.1; // Extra food for conditions
                    if (['disgruntled', 'unhappy'].includes(member.mood)) gameState.credits -= 1; // Inefficiency
                });
                gameState.food -= foodDecrement;

                if (gameState.fuel <= 0 || gameState.food <= 0) {
                    gameState.gameOver = true;
                } else if (gameState.distance <= 0) {
                    gameState.gameOver = true;
                }

                updateStatus();
                updateConditionsAndMood();
                saveGame();

                if (!gameState.gameOver) {
                    setTimeout(triggerEvent, 1000);
                } else {
                    triggerEvent();
                }
                console.log('Choice made:', choice.text, 'Result:', result);
            };
            choicesDiv.appendChild(button);
        });
        console.log('Event triggered:', event.text);
    }

    // Start game
    //loadGame();
    updateStatus();
    updateCrew();
    triggerEvent();
    console.log('Game started');
});
