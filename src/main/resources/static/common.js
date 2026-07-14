function showToast(message, type = 'error') {
    let toast = document.createElement('div');
    toast.className = `retro-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0) translateX(-50%)'; }, 10);
    
    // Animate out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px) translateX(-50%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const CORE_GAMES_COMMON = [
    'red', 'blue', 'yellow', 'gold', 'silver', 'crystal', 
    'ruby', 'sapphire', 'emerald', 'firered', 'leafgreen',
    'diamond', 'pearl', 'platinum', 'heartgold', 'soulsilver',
    'black', 'white', 'black-2', 'white-2', 'x', 'y',
    'omega-ruby', 'alpha-sapphire', 'sun', 'moon', 'ultra-sun', 'ultra-moon',
    'lets-go-pikachu', 'lets-go-eevee',
    'sword', 'shield', 'the-isle-of-armor', 'the-crown-tundra',
    'brilliant-diamond', 'shining-pearl', 'legends-arceus', 
    'scarlet', 'violet', 'the-teal-mask', 'the-indigo-disk'
];

function getEvoDetailsTextCommon(details) {
    if(!details || details.length === 0) return "";
    let d = details[0];
    let triggers = [];
    if (d.min_level) triggers.push(`LV${d.min_level}`);
    if (d.item) triggers.push(`Item: ${d.item.name}`);
    if (d.trigger && d.trigger.name === 'trade') triggers.push(`Troca`);
    if (d.min_happiness) triggers.push(`Felicidade`);
    if (d.known_move) triggers.push(`Saber: ${d.known_move.name}`);
    if (d.location) triggers.push(`Local: ${d.location.name}`);
    if (d.time_of_day) triggers.push(`Tempo: ${d.time_of_day}`);
    
    if (triggers.length > 0) return `(${triggers.join(', ')})`;
    return `(${d.trigger ? d.trigger.name : '?'})`;
}

function parseEvolutionChainCommon(chainNode, currentPath = "") {
    let paths = [];
    let name = chainNode.species.name;
    let step = currentPath === "" ? name : currentPath + " -> " + name;

    if (chainNode.evolves_to.length === 0) {
        paths.push(step);
    } else {
        chainNode.evolves_to.forEach(nextEvo => {
            let evoText = getEvoDetailsTextCommon(nextEvo.evolution_details);
            let nextPath = currentPath === "" 
                ? `${name} <span style="color:#fff; font-size: 0.45rem;">${evoText}</span>` 
                : `${step} <span style="color:#fff; font-size: 0.45rem;">${evoText}</span>`;
            paths.push(...parseEvolutionChainCommon(nextEvo, nextPath));
        });
    }
    return paths;
}

async function fetchPokemonFromPokeAPIAndSave(nome, fallbackId) {
    try {
        const initialRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);
        if (!initialRes.ok) throw new Error("Pokémon não encontrado na PokéAPI");
        const initialData = await initialRes.json();

        const speciesRes = await fetch(initialData.species.url);
        const speciesData = await speciesRes.json();
        
        let defaultVariety = speciesData.varieties.find(v => v.is_default) || speciesData.varieties[0];
        
        const pokeRes = await fetch(defaultVariety.pokemon.url);
        const data = await pokeRes.json();
        
        let spriteUrl = data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default || "";
        let tipos = data.types.map(t => t.type.name).join(", ");
        
        let eggGroups = speciesData.egg_groups && speciesData.egg_groups.length > 0 
            ? speciesData.egg_groups.map(e => e.name).join(", ") 
            : "Desconhecido";

        let evolutionChainHTML = "Não evolui.";
        if (speciesData.evolution_chain) {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            evolutionChainHTML = parseEvolutionChainCommon(evoData.chain).join("<br><br>");
        }
        
        let levelUp = [];
        let machine = [];
        let egg = [];
        let tutor = [];

        data.moves.forEach(m => {
            let details = m.version_group_details;
            if(!details || details.length === 0) return;
            let latestDetail = details[details.length - 1];
            let method = latestDetail.move_learn_method.name;
            let moveInfo = { name: m.move.name, level: latestDetail.level_learned_at };
            
            if(method === 'level-up') levelUp.push(moveInfo);
            else if(method === 'machine') machine.push(moveInfo);
            else if(method === 'egg') egg.push(moveInfo);
            else if(method === 'tutor') tutor.push(moveInfo);
        });

        levelUp.sort((a,b) => a.level - b.level);
        let movesHTML = "<strong>POR NÍVEL (LEVEL UP):</strong><br>";
        movesHTML += levelUp.length > 0 ? levelUp.map(m => `Lv.${m.level} - ${m.name}`).join("<br>") : "Nenhum";
        movesHTML += "<br><br><strong>TM/HM (MÁQUINA):</strong><br>";
        movesHTML += machine.length > 0 ? machine.map(m => m.name).join(", ") : "Nenhum";
        movesHTML += "<br><br><strong>EGG MOVES:</strong><br>";
        movesHTML += egg.length > 0 ? egg.map(m => m.name).join(", ") : "Nenhum";
        movesHTML += "<br><br><strong>TUTOR MOVES:</strong><br>";
        movesHTML += tutor.length > 0 ? tutor.map(m => m.name).join(", ") : "Nenhum";

        let locHTML = "Desconhecido";
        try {
            const encRes = await fetch(data.location_area_encounters);
            const encounters = await encRes.json();
            let locByGame = {};
            CORE_GAMES_COMMON.forEach(g => locByGame[g] = []);
            encounters.forEach(enc => {
                let areaName = enc.location_area.name.replace(/-/g, ' ');
                enc.version_details.forEach(vd => {
                    let game = vd.version.name;
                    if(locByGame[game] !== undefined && !locByGame[game].includes(areaName)) {
                        locByGame[game].push(areaName);
                    }
                });
            });
            locHTML = "";
            CORE_GAMES_COMMON.forEach(game => {
                let locs = locByGame[game];
                locHTML += `<strong>${game.toUpperCase()}:</strong> `;
                if(locs.length > 0) locHTML += `<span style="color: #000;">${locs.join(", ")}</span><br><br>`;
                else locHTML += `<span style="color: #666;">Não disponível para captura.</span><br><br>`;
            });
        } catch(e) { }

        let formsObj = [];
        formsObj.push({ type: 'normal', emoji: '⚪', name: defaultVariety.pokemon.name, spriteUrl: spriteUrl, spriteUrlShiny: data.sprites?.other?.['official-artwork']?.front_shiny || data.sprites?.other?.home?.front_shiny || data.sprites?.front_shiny, tipos: tipos, ataques: movesHTML, locais: locHTML });
        formsObj.push({ type: 'shiny', emoji: '✨', name: defaultVariety.pokemon.name, spriteUrl: data.sprites?.other?.['official-artwork']?.front_shiny || data.sprites?.other?.home?.front_shiny || data.sprites?.front_shiny, tipos: tipos, ataques: movesHTML, locais: locHTML });
        
        let formPromises = speciesData.varieties
            .filter(v => !v.is_default)
            .map(async (v) => {
                let formName = v.pokemon.name.toLowerCase();
                let emoji = '🟡';
                if (formName.includes('-mega') || formName.includes('-gmax')) emoji = '💥';
                else if (formName.includes('-alola') || formName.includes('-galar') || formName.includes('-hisui') || formName.includes('-paldea')) emoji = '🌐';
                
                try {
                    let fRes = await fetch(v.pokemon.url);
                    let fData = await fRes.json();
                    
                    let vShiny = fData.sprites?.other?.['official-artwork']?.front_shiny || fData.sprites?.other?.home?.front_shiny || fData.sprites?.front_shiny;
                    let vNormal = fData.sprites?.other?.['official-artwork']?.front_default || fData.sprites?.other?.home?.front_default || fData.sprites?.front_default;
                    
                    return {
                        type: 'variant', emoji: emoji, name: formName,
                        spriteUrl: vNormal,
                        spriteUrlShiny: vShiny,
                        tipos: fData.types.map(t => t.type.name).join(", "),
                        ataques: movesHTML,
                        locais: locHTML
                    };
                } catch(e) {
                    return null;
                }
            });

        let loadedForms = await Promise.all(formPromises);
        loadedForms.filter(f => f !== null).forEach(f => formsObj.push(f));

        let dbObject = {
            id: fallbackId || data.id,
            nome: nome.toLowerCase(),
            spriteUrl: spriteUrl,
            tipos: tipos,
            eggGroups: eggGroups,
            evolutionChain: evolutionChainHTML,
            locaisCaptura: locHTML,
            ataques: movesHTML,
            formas: JSON.stringify(formsObj)
        };

        await fetch('/api/pokemon/salvarDetalhes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dbObject)
        });

        return dbObject;

    } catch(err) {
        throw err;
    }
}
