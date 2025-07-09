document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const eventText = document.getElementById('event-text');
    const choicesDiv = document.getElementById('choices');
    const statusList = document.getElementById('status-list');
    const crewList = document.getElementById('crew-list');
    const cargoList = document.getElementById('cargo-list');
    const resetButton = document.getElementById('resetButton');

    // Debug missing elements
    if (!eventText) console.error('Element #event-text not found');
    if (!choicesDiv) console.error('Element #choices not found');
    if (!statusList) console.error('Element #status-list not found');
    if (!crewList) console.error('Element #crew-list not found');
    if (!cargoList) console.error('Element #cargo-list not found');
    if (!resetButton) console.error('Element #resetButton not found');

    // Default game state
    const defaultGameState = {
        distance: 2250,
        fuel: 900,
        food: 550,
        credits: 100,
        parts: 450,
        gameOver: false,
        familySize: 4,
        crew: []
    };

    // Game state
    let gameState = { ...defaultGameState };

    // xAI-generated crew names
    const crewNames = [
        'Zara Klyne', 'Torin Vex', 'Elara Syn', 'Kael Dracon', 'Nova Quill',
        'Jaxon Holt', 'Selene Vox', 'Ryn Solaris', 'Aria Zenith', 'Cassian Flux',
        'Lyra Nexis', 'Dax Orion', 'Mira Celest', 'Soren Kade', 'Veda Starling',
        'Zane Pulsar', 'Taryn Eclipse', 'Lila Cosmo', 'Finn Graviton', 'Esme Lumen'
    ];

    // Randomize crew
    function randomizeCrew() {
        gameState.familySize = Math.floor(Math.random() * 3) + 4;
        gameState.food = gameState.familySize * 137.5; // Adjusted for 550 units initial
        gameState.parts = 450;
        gameState.fuel = 900;
        gameState.crew = [];
        const shuffledNames = crewNames.sort(() => Math.random() - 0.5);
        for (let i = 0; i < gameState.familySize; i++) {
            gameState.crew.push({
                name: shuffledNames[i],
                conditions: [],
                mood: 'content'
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
            try {
                const parsedState = JSON.parse(saved);
                gameState = {
                    ...defaultGameState,
                    ...parsedState,
                    crew: parsedState.crew || [],
                    familySize: parsedState.familySize || 4
                };
                if (gameState.parts === undefined) {
                    gameState.parts = 450;
                    console.log('Added missing parts to gameState');
                }
                if (gameState.fuel === undefined) {
                    gameState.fuel = 900;
                    console.log('Added missing fuel to gameState');
                }
                if (gameState.food === undefined) {
                    gameState.food = gameState.familySize * 137.5;
                    console.log('Added missing food to gameState');
                }
                console.log('Game state loaded', gameState);
                updateStatus();
                updateCrew();
                updateCargo();
            } catch (e) {
                console.error('Failed to parse saved game state:', e);
                randomizeCrew();
            }
        } else {
            randomizeCrew();
        }
    }

    // Array of setting-themed deaths
    const deathCauses = [
        'radiation poisoning from a shield failure',
        'asphyxiation due to a life support failure',
        'decompression sickness from a hull breach',
        'electrical shock during repairs',
        'crush injury from a malfunctioning cargo bay door',
        'thermal burns from overheating equipment',
        'toxic chemical exposure from a coolant leak',
        'impact trauma from debris collision',
        'hypothermia from a thermal system failure',
        'cardiac arrest from extreme stress'
    ];

    // Events (removed Science, Social, Smuggling events)
    const events = [
        {
            text: "A solar flare threatens electronics. Shield systems or divert course?",
            choices: [
                {
                    text: "Shield", action: () => {
                        gameState.credits -= 20;
                        return Math.random() < 0.7 ? "Electronics protected!" : (gameState.fuel -= 10, "Shields fail! -10 fuel.");
                    }
                },
                {
                    text: "Divert", action: () => {
                        gameState.fuel -= 15;
                        return "Safe detour, fuel dips.";
                    }
                }
            ]
        },
        {
            text: "Meteor shower ahead. Navigate through or wait it out?",
            choices: [
                {
                    text: "Navigate", action: () => {
                        return Math.random() < 0.6 ? "Skillful piloting!" : (gameState.credits -= 15, "Hull hit! -15 credits.");
                    }
                },
                {
                    text: "Wait", action: () => {
                        gameState.distance += 10;
                        return "Safe, but you lose time.";
                    }
                }
            ]
        },
        {
            text: "Food spoilage detected. Ration supplies or buy replacements?",
            choices: [
                {
                    text: "Ration", action: () => {
                        gameState.food -= 10;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.3) member.mood = 'disgruntled';
                        });
                        return "Family grumbles but survives.";
                    }
                },
                {
                    text: "Buy", action: () => {
                        gameState.credits -= 20;
                        gameState.food += 15;
                        return "Fresh supplies secured.";
                    }
                }
            ]
        },
        {
            text: "Distress signal nearby. Help them or continue?",
            choices: [
                {
                    text: "Help", action: () => {
                        gameState.fuel -= 10;
                        gameState.food -= 10;
                        return Math.random() < 0.5 ? (gameState.credits += 20, "They share tech! +20 credits.") : "No reward, just thanks.";
                    }
                },
                { text: "Continue", action: () => "You move on, guilt lingering." }
            ]
        },
        {
            text: "Engine overheating. Vent heat or reduce speed?",
            choices: [
                {
                    text: "Vent", action: () => {
                        gameState.fuel -= 10;
                        return "Engine stabilized.";
                    }
                },
                {
                    text: "Reduce", action: () => {
                        gameState.distance += 10;
                        return "Safe, but progress slows.";
                    }
                }
            ]
        },
        {
            text: "Space debris blocks path. Blast it or maneuver?",
            choices: [
                {
                    text: "Blast", action: () => {
                        gameState.fuel -= 15;
                        return "Path cleared!";
                    }
                },
                {
                    text: "Maneuver", action: () => {
                        return Math.random() < 0.8 ? "Smooth sailing!" : (gameState.credits -= 10, "Hull scraped! -10 credits.");
                    }
                }
            ]
        },
        {
            text: "Family member ill. Use supplies or seek clinic?",
            choices: [
                {
                    text: "Supplies", action: () => {
                        gameState.credits -= 15;
                        const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                        member.conditions = member.conditions.filter(c => c !== 'sick');
                        return "They recover fully.";
                    }
                },
                {
                    text: "Clinic", action: () => {
                        gameState.distance += 15;
                        gameState.credits -= 10;
                        const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                        member.conditions = member.conditions.filter(c => c !== 'sick');
                        return "Professional care succeeds.";
                    }
                }
            ]
        },
        {
            text: "Pirates demand credits. Pay or fight?",
            choices: [
                {
                    text: "Pay", action: () => {
                        gameState.credits -= 25;
                        return "Pirates leave you alone.";
                    }
                },
                {
                    text: "Fight", action: () => {
                        if (Math.random() < 0.6) {
                            gameState.credits += 10;
                            return "Pirates retreat! +10 credits.";
                        } else {
                            gameState.fuel -= 15;
                            const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                            if (!member.conditions.includes('injured')) member.conditions.push('injured');
                            return "Damage taken! -15 fuel.";
                        }
                    }
                }
            ]
        },
        {
            text: "Fuel leak detected. Patch or conserve?",
            choices: [
                {
                    text: "Patch", action: () => {
                        gameState.credits -= 15;
                        gameState.parts -= 15;
                        return "Leak fixed, fuel saved.";
                    }
                },
                {
                    text: "Conserve", action: () => {
                        gameState.distance += 10;
                        gameState.fuel -= 5;
                        return "Leak persists but manageable.";
                    }
                }
            ]
        },
        {
            text: "Trader offers food for credits. Trade or decline?",
            choices: [
                {
                    text: "Trade", action: () => {
                        gameState.credits -= 20;
                        gameState.food += 20;
                        return "Pantry restocked!";
                    }
                },
                { text: "Decline", action: () => "You pass on the offer." }
            ]
        },
        {
            text: "Radiation leak in quarters. Seal area or evacuate?",
            choices: [
                {
                    text: "Seal Area", action: () => {
                        gameState.credits -= 15;
                        gameState.parts -= 10;
                        return "Leak contained.";
                    }
                },
                {
                    text: "Evacuate", action: () => {
                        gameState.distance += 10;
                        return "Crew safe, but progress slows.";
                    }
                }
            ]
        },
        {
            text: "Navigation error detected. Recalibrate or burn extra fuel?",
            choices: [
                {
                    text: "Recalibrate", action: () => {
                        gameState.credits -= 10;
                        return Math.random() < 0.8 ? "Course corrected." : (gameState.distance += 5, "Minor delay.");
                    }
                },
                {
                    text: "Burn Fuel", action: () => {
                        gameState.fuel -= 15;
                        return "Back on track.";
                    }
                }
            ]
        },
        {
            text: "Oxygen filter fails. Replace it or ration air?",
            choices: [
                {
                    text: "Replace", action: () => {
                        gameState.credits -= 20;
                        gameState.parts -= 15;
                        return "Breathing restored.";
                    }
                },
                {
                    text: "Ration", action: () => {
                        gameState.food -= 5;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.3) member.mood = 'unhappy';
                        });
                        return "Crew manages, but morale dips.";
                    }
                }
            ]
        },
        {
            text: "Solar panel malfunctions. Repair or divert fuel?",
            choices: [
                {
                    text: "Repair", action: () => {
                        gameState.credits -= 15;
                        gameState.parts -= 10;
                        return "Power restored.";
                    }
                },
                {
                    text: "Divert Fuel", action: () => {
                        gameState.fuel -= 10;
                        return "Backup power online.";
                    }
                }
            ]
        },
        {
            text: "Communication blackout with Earth. Boost signal or wait?",
            choices: [
                {
                    text: "Boost Signal", action: () => {
                        gameState.fuel -= 10;
                        return "Contact restored.";
                    }
                },
                {
                    text: "Wait", action: () => {
                        gameState.distance += 10;
                        return "Signal returns, but delayed.";
                    }
                }
            ]
        },
        {
            text: "Crew conflict escalates. Mediate or let it resolve?",
            choices: [
                {
                    text: "Mediate", action: () => {
                        gameState.food -= 10;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.5) member.mood = 'content';
                        });
                        return "Harmony restored.";
                    }
                },
                {
                    text: "Let Resolve", action: () => {
                        if (Math.random() < 0.6) {
                            return "Crew works it out.";
                        } else {
                            gameState.credits -= 5;
                            gameState.crew.forEach(member => {
                                if (Math.random() < 0.3) member.mood = 'disgruntled';
                            });
                            return "Morale suffers. -5 credits.";
                        }
                    }
                }
            ]
        },
        {
            text: "Micrometeorite damages hull. Patch now or later?",
            choices: [
                {
                    text: "Patch Now", action: () => {
                        gameState.credits -= 20;
                        gameState.parts -= 15;
                        return "Hull secured.";
                    }
                },
                {
                    text: "Patch Later", action: () => {
                        return Math.random() < 0.7 ? "No further damage." : (gameState.fuel -= 10, "Fuel leaks. -10 fuel.");
                    }
                }
            ]
        },
        {
            text: "Water recycler jams. Fix or ration water?",
            choices: [
                {
                    text: "Fix", action: () => {
                        gameState.credits -= 15;
                        gameState.parts -= 10;
                        return "Water supply restored.";
                    }
                },
                {
                    text: "Ration", action: () => {
                        gameState.food -= 5;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.3) member.mood = 'unhappy';
                        });
                        return "Crew copes, but unhappy.";
                    }
                }
            ]
        },
        {
            text: "Rare cosmic phenomenon detected. Study or stay on course?",
            choices: [
                {
                    text: "Study", action: () => {
                        gameState.distance += 10;
                        return Math.random() < 0.5 ? (gameState.credits += 20, "Data sold! +20 credits.") : "No usable data.";
                    }
                },
                { text: "Stay on Course", action: () => "Progress continues." }
            ]
        },
        {
            text: "Power surge threatens systems. Shut down or reroute?",
            choices: [
                {
                    text: "Shut Down", action: () => {
                        gameState.distance += 10;
                        return "Systems safe.";
                    }
                },
                {
                    text: "Reroute", action: () => {
                        gameState.fuel -= 15;
                        return "Power stabilized.";
                    }
                }
            ]
        },
        {
            text: "A wandering trader offers to buy your resources for credits. Choose to sell or decline.",
            choices: [
                {
                    text: "Sell Food", action: () => {
                        gameState.food -= 20;
                        gameState.credits += 15;
                        return "Sold 20 food for 15 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to buy your resources for credits. Choose to sell or decline.",
            choices: [
                {
                    text: "Sell Fuel", action: () => {
                        gameState.fuel -= 15;
                        gameState.credits += 20;
                        return "Sold 15 fuel for 20 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to buy your resources for credits. Choose to sell or decline.",
            choices: [
                {
                    text: "Sell Parts", action: () => {
                        gameState.parts -= 15;
                        gameState.credits += 18;
                        return "Sold 15 parts for 18 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to buy your resources for credits. Choose to sell or decline.",
            choices: [
                {
                    text: "Sell Supplies", action: () => {
                        gameState.credits += 36;
                        gameState.food -= 10;
                        gameState.fuel -= 10;
                        gameState.parts -= 10;
                        return "Bought 10 food, fuel, parts for 30 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to sell you resources for credits. Choose to Buy or decline.",
            choices: [
                {
                    text: "Buy Food", action: () => {
                        gameState.food += 20;
                        gameState.credits -= 15;
                        return "Bought 20 food for 15 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to sell you resources for credits. Choose to Buy or decline.",
            choices: [
                {
                    text: "Buy Fuel", action: () => {
                        gameState.fuel += 15;
                        gameState.credits -= 20;
                        return "Bought 15 fuel for 20 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to sell you resources for credits. Choose to Buy or decline.",
            choices: [
                {
                    text: "Buy Parts", action: () => {
                        gameState.parts += 15;
                        gameState.credits -= 18;
                        return "Bought 15 parts for 18 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to sell you Astrocartography Data for credits. Choose to Buy or decline.",
            choices: [
                {
                    text: "Buy Data", action: () => {
                        gameState.credits += 25;
                        return Math.random() < 0.45 ? (gameState.distance -= 10, "Data was useful! -10 distance.") : "No usable data.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A wandering trader offers to sell you resources for credits. Choose to Buy or decline.",
            choices: [
                {
                    text: "Buy Supplies", action: () => {
                        gameState.credits -= 30;
                        gameState.food += 10;
                        gameState.fuel += 10;
                        gameState.parts += 10;
                        return "Bought 10 food, fuel, parts for 30 credits.";
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "The life support system glitches, reducing oxygen levels. Emergency reboot or manual bypass?",
            choices: [
                {
                    text: "Reboot", action: () => {
                        gameState.parts -= 15;
                        gameState.credits -= 10;
                        return "Oxygen restored.";
                    }
                },
                {
                    text: "Bypass", action: () => {
                        gameState.food -= 5;
                        if (Math.random() < 0.3) {
                            const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                            if (!member.conditions.includes('distraught')) member.conditions.push('distraught');
                        }
                        return "Bypass successful, crew strained.";
                    }
                }
            ]
        },
        {
            text: "An unexpected asteroid field blocks your path. Plot a precise course or power through?",
            choices: [
                {
                    text: "Precise Course", action: () => {
                        gameState.distance += 10;
                        return "Safe passage.";
                    }
                },
                {
                    text: "Power Through", action: () => {
                        gameState.fuel -= 15;
                        return Math.random() < 0.6 ? "Cleared field!" : (gameState.parts -= 10, "Hull grazed, parts lost.");
                    }
                }
            ]
        },
        {
            text: "The thermal regulation system fails, risking overheating. Vent heat or reduce power?",
            choices: [
                {
                    text: "Vent Heat", action: () => {
                        gameState.fuel -= 15;
                        return "Systems cooled.";
                    }
                },
                {
                    text: "Reduce Power", action: () => {
                        gameState.distance += 10;
                        return "Temperature stabilized, progress slowed.";
                    }
                }
            ]
        },
        {
            text: "The crew shows signs of extreme fatigue. Enforce rest or push forward?",
            choices: [
                {
                    text: "Enforce Rest", action: () => {
                        gameState.food -= 10;
                        gameState.crew.forEach(member => {
                            if (Math.random() < 0.5) member.mood = 'content';
                        });
                        return "Crew refreshed.";
                    }
                },
                {
                    text: "Push Forward", action: () => {
                        if (Math.random() < 0.3) {
                            const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                            if (!member.conditions.includes('distraught')) member.conditions.push('distraught');
                        }
                        return "Crew pushes on, but strained.";
                    }
                }
            ]
        },
        {
            text: "A radiation shield panel is breached. Repair now or reroute power?",
            choices: [
                {
                    text: "Repair", action: () => {
                        gameState.parts -= 15;
                        gameState.credits -= 10;
                        return "Shield restored.";
                    }
                },
                {
                    text: "Reroute Power", action: () => {
                        gameState.fuel -= 15;
                        return "Radiation mitigated, fuel consumed.";
                    }
                }
            ]
        },
        {
            text: "The propulsion system risks overload. Cool it down or throttle back?",
            choices: [
                {
                    text: "Cool Down", action: () => {
                        gameState.parts -= 15;
                        return "Propulsion stabilized.";
                    }
                },
                {
                    text: "Throttle Back", action: () => {
                        gameState.distance += 10;
                        return "Overload prevented, progress slowed.";
                    }
                }
            ]
        },
        {
            text: "Critical navigation data is corrupted. Recompute or use backups?",
            choices: [
                {
                    text: "Recompute", action: () => {
                        gameState.credits -= 15;
                        return "Data restored.";
                    }
                },
                {
                    text: "Use Backups", action: () => {
                        gameState.distance += 10;
                        return "Backups loaded, progress delayed.";
                    }
                }
            ]
        },
        {
            text: "Microfractures are detected in the hull. Seal them or monitor?",
            choices: [
                {
                    text: "Seal", action: () => {
                        gameState.parts -= 10;
                        gameState.credits -= 10;
                        return "Fractures sealed.";
                    }
                },
                {
                    text: "Monitor", action: () => {
                        return Math.random() < 0.7 ? "No issues detected." : (gameState.fuel -= 10, "Leaks worsen, fuel lost.");
                    }
                }
            ]
        },
        {
            text: "A crew experiment goes wrong, risking equipment. Abort or salvage?",
            choices: [
                {
                    text: "Abort", action: () => {
                        gameState.credits -= 10;
                        return "Experiment halted.";
                    }
                },
                {
                    text: "Salvage", action: () => {
                        if (Math.random() < 0.8) {
                            gameState.credits += 10;
                            return "Equipment saved, +10 credits!";
                        } else {
                            const member = gameState.crew[Math.floor(Math.random() * gameState.familySize)];
                            if (!member.conditions.includes('injured')) member.conditions.push('injured');
                            return "Crew injured.";
                        }
                    }
                }
            ]
        },
        {
            text: "A solar wind surge disrupts electronics. Reinforce shields or power down?",
            choices: [
                {
                    text: "Reinforce Shields", action: () => {
                        gameState.parts -= 10;
                        gameState.fuel -= 10;
                        return "Electronics protected.";
                    }
                },
                {
                    text: "Power Down", action: () => {
                        gameState.distance += 10;
                        return "Systems safe, progress slowed.";
                    }
                }
            ]
        },
        {
            text: "A trader offers Science equipment for 30 credits. Buy or decline?",
            choices: [
                {
                    text: "Buy", action: () => {
                        if (gameState.credits >= 30 && getTotalCargoUnits() + 50 <= 2400) {
                            gameState.credits -= 30;
                            gameState.food += 50; // Using food as a placeholder; replace with science cargo if tracked separately
                            return "Bought 50 units of Science equipment.";
                        } else if (gameState.credits < 30) {
                            return "Not enough credits!";
                        } else {
                            return "Cargo capacity full!";
                        }
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A trader offers Social supplies for 25 credits. Buy or decline?",
            choices: [
                {
                    text: "Buy", action: () => {
                        if (gameState.credits >= 25 && getTotalCargoUnits() + 50 <= 2400) {
                            gameState.credits -= 25;
                            gameState.parts += 50; // Using parts as a placeholder; replace with social cargo if tracked separately
                            return "Bought 50 units of Social supplies.";
                        } else if (gameState.credits < 25) {
                            return "Not enough credits!";
                        } else {
                            return "Cargo capacity full!";
                        }
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A shady trader offers Smuggling goods for 40 credits. Buy or decline?",
            choices: [
                {
                    text: "Buy", action: () => {
                        if (gameState.credits >= 40 && getTotalCargoUnits() + 50 <= 2400) {
                            gameState.credits -= 40;
                            gameState.fuel += 50; // Using fuel as a placeholder; replace with smuggling cargo if tracked separately
                            return "Bought 50 units of Smuggling goods.";
                        } else if (gameState.credits < 40) {
                            return "Not enough credits!";
                        } else {
                            return "Cargo capacity full!";
                        }
                    }
                },
                { text: "Decline", action: () => "You pass on the deal." }
            ]
        },
        {
            text: "A tragic incident claims a crew members life. [Cause]. Mourn or press on?",
            choices: [
                {
                    text: "Mourn", action: () => {
                        const memberIndex = Math.floor(Math.random() * gameState.familySize);
                        const member = gameState.crew[memberIndex];
                        const cause = deathCauses[Math.floor(Math.random() * deathCauses.length)];
                        gameState.crew.splice(memberIndex, 1);
                        gameState.familySize -= 1;
                        gameState.distance += 10;
                        gameState.food -= 10;
                        gameState.crew.forEach(m => {
                            if (Math.random() < 0.5) m.mood = 'distraught';
                        });
                        return `${member.name} dies from ${cause}. The crew mourns, morale suffers.`;
                    }
                },
                {
                    text: "Press On", action: () => {
                        const memberIndex = Math.floor(Math.random() * gameState.familySize);
                        const member = gameState.crew[memberIndex];
                        const cause = deathCauses[Math.floor(Math.random() * deathCauses.length)];
                        gameState.crew.splice(memberIndex, 1);
                        gameState.familySize -= 1;
                        const moraleHit = Math.random() < 0.7;
                        if (moraleHit) {
                            gameState.crew.forEach(m => {
                                if (!m.conditions.includes('distraught')) m.conditions.push('distraught');
                            });
                            return `${member.name} dies from ${cause}. Crew resents the decision.`;
                        }
                        return `${member.name} dies from ${cause}. Crew stays focused.`;
                    }
                }
            ]
        }
    ];

    function getTotalCargoUnits() {
        return (gameState.fuel || 0) + (gameState.food || 0) + (gameState.parts || 0);
    }

    function updateStatus() {
        if (!statusList) {
            console.error('Cannot update status: statusList is null');
            return;
        }
        if (gameState.distance === undefined) console.error('Distance is undefined');
        if (gameState.fuel === undefined) console.error('Fuel is undefined');
        if (gameState.food === undefined) console.error('Food is undefined');
        if (gameState.parts === undefined) console.error('Parts is undefined');
        if (gameState.credits === undefined) console.error('Credits is undefined');
        if (gameState.familySize === undefined) console.error('FamilySize is undefined');

        statusList.innerHTML = `
            <div class="status-item">Distance: ${gameState.distance || 2250} M km</div>
            <div class="status-item">Fuel: ${(gameState.fuel || 900).toFixed(1)} units</div>
            <div class="status-item">Food: ${(gameState.food || 550).toFixed(1)} units</div>
            <div class="status-item">Parts: ${(gameState.parts || 450).toFixed(1)} units</div>
            <div class="status-item">Credits: ${gameState.credits || 100}</div>
            <div class="status-item">Family: ${gameState.familySize || 4}</div>
        `;
        console.log('Status updated:', gameState);
    }

    function updateCargo() {
        if (!cargoList) {
            console.error('Cannot update cargo: cargoList is null');
            return;
        }
        cargoList.innerHTML = '';

        // Each icon represents 50 units
        const cargoTypes = [
            { name: 'fuel', units: gameState.fuel || 900, icon: 'fuel.png' },
            { name: 'food', units: gameState.food || 550, icon: 'food.png' },
            { name: 'parts', units: gameState.parts || 450, icon: 'parts.png' }
        ];

        let totalSlots = 0;
        cargoTypes.forEach(cargo => {
            const numIcons = Math.floor(cargo.units / 50); // 1 icon per 50 units
            for (let i = 0; i < numIcons && totalSlots < 48; i++) {
                const icon = document.createElement('img');
                icon.src = `assets/${cargo.icon}`;
                icon.className = 'cargo-icon';
                icon.alt = cargo.name;
                cargoList.appendChild(icon);
                totalSlots++;
            }
        });

        // Fill remaining slots with empty placeholders
        while (totalSlots < 48) {
            const placeholder = document.createElement('div');
            placeholder.className = 'cargo-icon';
            placeholder.style.background = 'rgba(255, 255, 255, 0.1)';
            cargoList.appendChild(placeholder);
            totalSlots++;
        }

        console.log('Cargo updated:', cargoTypes, 'Total slots:', totalSlots);
    }

    function updateCrew() {
        if (!crewList) {
            console.error('Cannot update crew: crewList is null');
            return;
        }
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
            if (gameState.food <= 0 && !member.conditions.includes('starving')) {
                member.conditions.push('starving');
                member.mood = 'unhappy';
            } else if (gameState.food > 0 && member.conditions.includes('starving')) {
                member.conditions = member.conditions.filter(c => c !== 'starving');
            }
            if (gameState.food < 100 || gameState.parts < 100 || member.conditions.length > 0) {
                if (member.mood === 'happy' || member.mood === 'content') {
                    member.mood = 'accepting';
                } else if (member.mood === 'accepting') {
                    member.mood = 'disgruntled';
                }
            } else if (gameState.food > 300 && gameState.parts > 300 && member.conditions.length === 0) {
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
        if (!eventText || !choicesDiv) {
            console.error('Cannot trigger event: eventText or choicesDiv is null');
            return;
        }
        if (gameState.gameOver) {
            eventText.textContent = gameState.distance <= 0 ? "You reached Mars! You win!" : "Game Over: You ran out of resources.";
            choicesDiv.innerHTML = '';
            console.log('Game over');
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
                gameState.parts -= 3;
                let foodDecrement = gameState.familySize * 0.67;
                gameState.crew.forEach(member => {
                    if (member.conditions.length > 0) foodDecrement += 0.1;
                    if (['disgruntled', 'unhappy'].includes(member.mood)) gameState.credits -= 1;
                });
                gameState.food -= foodDecrement;

                if (gameState.credits < 0) gameState.credits = 0;

                if (gameState.fuel <= 0 || gameState.food <= 0 || gameState.parts <= 0) {
                    gameState.gameOver = true;
                } else if (gameState.distance <= 0) {
                    gameState.gameOver = true;
                }

                updateStatus();
                updateConditionsAndMood();
                updateCargo();
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

    // Reset game
    resetButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the game?')) {
            gameState = {
                distance: 2250,
                fuel: 900,
                food: gameState.familySize * 137.5,
                credits: 100,
                parts: 450,
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
            updateCargo();
            triggerEvent();
            saveGame();
            console.log('Game reset');
        }
    });

    // Start game
    loadGame();
    updateStatus();
    updateCrew();
    updateCargo();
    triggerEvent();
    console.log('Game started');
});
