const limit = 1500;



let currentForms = [];
let currentFormIndex = 0;
let currentDbData = null; // Guardará o objeto carregado do banco, se houver.
let loggedUser = null;
let capturasSet = new Set();
let timesSet = new Set();

function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('open');
}

function scrollToList() {
    document.getElementById('listPanel').scrollIntoView({ behavior: 'smooth' });
}

function scrollToInfo() {
    if (window.innerWidth <= 768) {
        document.getElementById('infoPanel').scrollIntoView({ behavior: 'smooth' });
    }
}

// Lógica de Filtragem
function filtrarPokemons() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    let ul = document.getElementById("lista");
    let li = ul.getElementsByTagName('li');

    for (let i = 0; i < li.length; i++) {
        let span = li[i].querySelector(".pokemon-name-list");
        if (span) {
            let txtValue = span.textContent || span.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
}

async function initApp() {
    try {
        let res = await fetch('/api/usuario/me');
        if(!res.ok) { window.location.href='/'; return; }
        loggedUser = await res.json();
        
        if(loggedUser.capturas) {
            let clean = loggedUser.capturas.replace(/\[|\]/g, "");
            if(clean !== "") {
                clean.split(",").forEach(id => capturasSet.add(parseInt(id.trim())));
            }
        }
        if(loggedUser.times) {
            let tArr = JSON.parse(loggedUser.times);
            tArr.forEach(team => {
                team.slots.forEach(slot => {
                    if(slot && slot.id) timesSet.add(slot.id);
                });
            });
        }
        if(loggedUser.admin) {
            document.getElementById('menuAdmin').style.display = 'block';
        }
        
        carregarTodosPokemons();
    } catch(err) {
        window.location.href='/';
    }
}

// Carregar Lista
function carregarTodosPokemons() {
    const loadingEl = document.getElementById("loading");
    if (loadingEl) loadingEl.style.display = "block";

    // Tentar buscar do nosso Banco de Dados local primeiro
    fetch('/api/pokemon/list')
        .then(res => res.json())
        .then(dbList => {
            if (dbList && dbList.length > 0) {
                // Banco de dados já possui a lista
                renderizarLista(dbList.sort((a,b) => a.id - b.id));
                if (loadingEl) loadingEl.style.display = "none";
                carregarPokemonInfo(dbList[0].nome, dbList[0].id, true);
            } else {
                // Banco de dados vazio, buscar da PokeAPI e salvar no banco
                fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=0`)
                    .then(res => res.json())
                    .then(data => {
                        let toSave = data.results.map((p, idx) => {
                            const idMatch = p.url.match(/\/(\d+)\/$/);
                            return { id: idMatch ? parseInt(idMatch[1]) : idx + 1, nome: p.name };
                        });
                        
                        // Salvar no nosso banco
                        fetch('/api/pokemon/salvarLista', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(toSave)
                        }).then(() => {
                            renderizarLista(toSave);
                            if (loadingEl) loadingEl.style.display = "none";
                            if (toSave.length > 0) carregarPokemonInfo(toSave[0].nome, toSave[0].id, true);
                        }).catch(err => {
                            console.error("Erro ao salvar lista no banco:", err);
                            renderizarLista(toSave);
                            if (loadingEl) loadingEl.style.display = "none";
                            if (toSave.length > 0) carregarPokemonInfo(toSave[0].nome, toSave[0].id, true);
                        });
                    });
            }
        })
        .catch(err => {
            console.error("Erro ao carregar lista:", err);
            if (loadingEl) loadingEl.textContent = "Erro ao carregar.";
        });
}

function renderizarLista(pokemons) {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    pokemons.forEach(pokemon => {
        const li = document.createElement("li");
        
        const captureStatus = document.createElement("span");
        captureStatus.className = "capture-status-list";
        captureStatus.textContent = capturasSet.has(pokemon.id) ? "🟢" : "🔴";
        captureStatus.id = "listCap_" + pokemon.id;
        
        const trophyStatus = document.createElement("span");
        trophyStatus.className = "trophy-status-list";
        trophyStatus.textContent = timesSet.has(pokemon.id) ? "🏆" : "";
        trophyStatus.id = "listTrophy_" + pokemon.id;
        
        const img = document.createElement("img");
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        img.alt = pokemon.nome;

        const nome = document.createElement("span");
        nome.className = "pokemon-name-list";
        nome.textContent = pokemon.nome;

        li.appendChild(captureStatus);
        li.appendChild(trophyStatus);
        li.appendChild(img);
        li.appendChild(nome);
        li.onclick = () => carregarPokemonInfo(pokemon.nome, pokemon.id);
        lista.appendChild(li);
    });
}



function nextForm() {
    if (currentForms.length === 0) return;
    currentFormIndex = (currentFormIndex + 1) % currentForms.length;
    renderCurrentFormUI();
}

async function toggleCaptura() {
    if(!currentDbData) return;
    let id = currentDbData.id;
    try {
        let res = await fetch(`/api/usuario/toggleCaptura/${id}`, { method: 'POST' });
        if(res.ok) {
            let updated = await res.json();
            capturasSet.clear();
            updated.forEach(c => capturasSet.add(c));
            renderCurrentFormUI(); // Update UI
            
            let listCap = document.getElementById("listCap_" + id);
            let listTrophy = document.getElementById("listTrophy_" + id);
            if(listCap) listCap.textContent = capturasSet.has(id) ? "🟢" : "🔴";
            if(listTrophy) listTrophy.textContent = timesSet.has(id) ? "🏆" : "";
        }
    } catch(e) {
        console.error(e);
    }
}

function carregarPokemonInfo(nome, fallbackId, isInitialLoad = false) {
    const nameEl = document.getElementById("pokemonNameDisplay");
    nameEl.textContent = "CARREGANDO...";
    document.getElementById("formEmojiBtn").textContent = "⚪";
    document.getElementById("captureBtn").style.display = "none";
    document.getElementById("pokemonImageDisplay").src = ""; 

    if (!isInitialLoad) {
        scrollToInfo();
    }

    // 1. Verificar se JÁ EXISTE no nosso banco de dados
    fetch(`/api/pokemon/${nome.toLowerCase()}`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Not in DB");
        })
        .then(async (dbPokemon) => {
            // Verifica dataBackup
            let desatualizado = true;
            if (dbPokemon.dataBackup) {
                let backupDate = new Date(dbPokemon.dataBackup);
                let hoje = new Date();
                let diffTime = Math.abs(hoje - backupDate);
                let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 30) desatualizado = false;
                if (!dbPokemon.locaisCaptura || !dbPokemon.locaisCaptura.includes('SWORD:')) {
                    desatualizado = true;
                }
            }

            if (desatualizado) {
                showToast("Sincronizando dados atualizados (30+ dias)...", "success");
                let freshData = await fetchPokemonFromPokeAPIAndSave(nome, fallbackId);
                currentDbData = freshData;
                currentForms = JSON.parse(freshData.formas || "[]");
            } else {
                currentDbData = dbPokemon;
                currentForms = JSON.parse(dbPokemon.formas || "[]");
            }
            
            currentFormIndex = 0;
            renderCurrentFormUI();
        })
        .catch(async (err) => {
            currentDbData = null;
            let freshData = await fetchPokemonFromPokeAPIAndSave(nome, fallbackId);
            currentDbData = freshData;
            currentForms = JSON.parse(freshData.formas || "[]");
            currentFormIndex = 0;
            renderCurrentFormUI();
        });
}

// Renderiza a Interface a partir dos dados locais/db
function renderCurrentFormUI() {
    if(!currentDbData || currentForms.length === 0) return;

    let form = currentForms[currentFormIndex];
    
    document.getElementById("formEmojiBtn").textContent = form.emoji;
    document.getElementById("pokemonNameDisplay").textContent = form.name;
    document.getElementById("pokemonImageDisplay").src = form.spriteUrl || "";
    document.getElementById("pokemonTypesDisplay").textContent = form.tipos;
    
    let captureBtn = document.getElementById("captureBtn");
    captureBtn.style.display = "inline";
    captureBtn.textContent = capturasSet.has(currentDbData.id) ? "🟢" : "🔴";
    
    let trophyBtn = document.getElementById("trophyBtn");
    if (!trophyBtn) {
        trophyBtn = document.createElement("span");
        trophyBtn.id = "trophyBtn";
        trophyBtn.style.marginLeft = "10px";
        captureBtn.parentNode.insertBefore(trophyBtn, captureBtn.nextSibling);
    }
    trophyBtn.textContent = timesSet.has(currentDbData.id) ? " 🏆" : "";
    
    // Dados globais da especie
    document.getElementById("pokemonEggGroupsDisplay").textContent = currentDbData.eggGroups;
    document.getElementById("pokemonEvoDisplay").innerHTML = currentDbData.evolutionChain;
    
    // Dados que podem variar por forma
    document.getElementById("pokemonMovesDisplay").innerHTML = form.ataques || currentDbData.ataques;
    document.getElementById("pokemonLocationsDisplay").innerHTML = form.locais || currentDbData.locaisCaptura;
    
    let sel = document.getElementById("movesGameSelect");
    if(sel) {
        let saved = sessionStorage.getItem('selectedMoveGame') || 'latest';
        sel.value = saved;
        if(saved !== 'latest') {
            window.updateMovesForSelectedGame();
        }
    }
}

window.updateMovesForSelectedGame = async function() {
    let sel = document.getElementById("movesGameSelect");
    if(!sel) return;
    let val = sel.value;
    sessionStorage.setItem('selectedMoveGame', val);
    
    if(!currentDbData) return;
    
    let display = document.getElementById("pokemonMovesDisplay");
    
    if(val === 'latest') {
        if(typeof currentForms !== 'undefined' && currentForms.length > 0 && typeof currentFormIndex !== 'undefined') {
            display.innerHTML = currentForms[currentFormIndex].ataques || currentDbData.ataques;
        } else {
            display.innerHTML = currentDbData.ataques;
        }
        return;
    }
    
    display.innerHTML = "Carregando...";
    
    try {
        let currentFormName = document.getElementById("pokemonNameDisplay").textContent.toLowerCase();
        
        window.apiMovesCache = window.apiMovesCache || {};
        let data;
        
        if (window.apiMovesCache[currentFormName]) {
            data = window.apiMovesCache[currentFormName];
        } else {
            let pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentFormName}`);
            data = await pokeRes.json();
            window.apiMovesCache[currentFormName] = data;
        }
        
        let levelUp = [];
        let machine = [];
        let egg = [];
        let tutor = [];

        data.moves.forEach(m => {
            let details = m.version_group_details.filter(vd => vd.version_group.name === val);
            if(!details || details.length === 0) return;
            let detail = details[0]; // should be just one per version_group
            let method = detail.move_learn_method.name;
            let moveInfo = { name: m.move.name, level: detail.level_learned_at };
            
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
        
        display.innerHTML = movesHTML;
    } catch(e) {
        console.error(e);
        display.innerHTML = "Erro ao carregar ataques.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});