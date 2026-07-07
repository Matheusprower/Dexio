let times = [];
let currentIndex = -1; // -1 means new team, >=0 means editing existing
let currentTeamSlots = [null, null, null, null, null, null];
let loggedUser = null;
let editingMode = true; 
let globalPokedexList = [];
let modalTargetSlot = -1;

async function initApp() {
    try {
        let res = await fetch('/api/usuario/me');
        if(!res.ok) { window.location.href='/'; return; }
        loggedUser = await res.json();
        if(loggedUser.admin) document.getElementById('menuAdmin').style.display = 'block';
        
        let tRes = await fetch('/api/usuario/times');
        let tText = await tRes.text();
        times = JSON.parse(tText || "[]");
        
        let pRes = await fetch('/api/pokemon/list');
        globalPokedexList = await pRes.json();
        globalPokedexList.sort((a,b)=> a.id - b.id);
        
        let trRes = await fetch('trainers.json');
        if(trRes.ok) {
            let trList = await trRes.json();
            setupTrainerAutocomplete(trList);
        }
        
        renderizarTimesList();
        renderSlots();
    } catch(err) {
        console.error(err);
    }
}

function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('open');
}

function scrollToList() {
    document.getElementById('listPanel').scrollIntoView({ behavior: 'smooth' });
}

function updateTrainerPreview(val) {
    let prev = document.getElementById('trainerPreview');
    if(!val || val.trim() === "") {
        prev.src = 'https://play.pokemonshowdown.com/sprites/trainers/unknown.png';
        return;
    }
    let cleanVal = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    let url = `https://play.pokemonshowdown.com/sprites/trainers/${cleanVal}.png`;
    prev.src = url;
    prev.onerror = () => { prev.src = 'https://play.pokemonshowdown.com/sprites/trainers/unknown.png'; };
}

function setupTrainerAutocomplete(list) {
    const input = document.getElementById('trainerNameInput');
    const autocompleteList = document.getElementById('trainerAutocompleteList');
    
    input.addEventListener('input', function() {
        let val = this.value;
        autocompleteList.innerHTML = '';
        updateTrainerPreview(val);
        
        if (!val) return false;
        
        let limit = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].toLowerCase().includes(val.toLowerCase())) {
                let item = document.createElement('div');
                item.textContent = list[i];
                item.addEventListener('click', function() {
                    input.value = this.textContent;
                    autocompleteList.innerHTML = '';
                    updateTrainerPreview(input.value);
                });
                autocompleteList.appendChild(item);
                limit++;
                if(limit > 20) break;
            }
        }
    });
    
    document.addEventListener('click', function (e) {
        if(e.target !== input) {
            autocompleteList.innerHTML = '';
        }
    });
}

function renderizarTimesList() {
    const container = document.getElementById('teamsListContainer');
    container.innerHTML = "";
    
    let searchTxt = (document.getElementById('teamSearchInput')?.value || "").toLowerCase();
    
    times.forEach((t, idx) => {
        if(searchTxt && !t.nome.toLowerCase().includes(searchTxt)) return;
        
        let card = document.createElement("div");
        card.className = "team-card";
        card.onclick = () => visualizarTime(idx);
        
        let title = document.createElement("div");
        title.className = "team-card-title";
        title.textContent = t.nome;
        card.appendChild(title);
        
        let sprites = document.createElement("div");
        sprites.className = "team-card-sprites";
        for(let i=0; i<6; i++) {
            let img = document.createElement("img");
            if(t.slots[i] && t.slots[i].spriteUrl) {
                img.src = t.slots[i].spriteUrl;
            } else {
                img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
                img.style.opacity = "0.3";
            }
            sprites.appendChild(img);
        }
        card.appendChild(sprites);
        container.appendChild(card);
    });
}

function renderSlots() {
    const container = document.getElementById('teamMembers');
    container.innerHTML = "";
    
    for(let i=0; i<6; i++) {
        let s = currentTeamSlots[i];
        let div = document.createElement('div');
        div.className = 'team-slot';
        
        if(s) {
            let star = document.createElement('div');
            star.className = 'star-btn';
            star.textContent = s.isShiny ? '✨' : '⭐';
            star.style.display = editingMode ? 'block' : 'none';
            star.title = "Alternar Shiny";
            star.onclick = (e) => {
                e.stopPropagation();
                if(editingMode) {
                    s.isShiny = !s.isShiny;
                    updateSprite(s, div.querySelector('.slot-img'));
                    star.textContent = s.isShiny ? '✨' : '⭐';
                }
            };
            
            let img = document.createElement('img');
            img.className = 'slot-img';
            img.src = s.spriteUrl;
            if(editingMode) img.onclick = () => openModal(i);
            
            let nickInput = document.createElement('input');
            nickInput.type = 'text';
            nickInput.className = 'team-nick-input';
            nickInput.placeholder = 'Apelido...';
            nickInput.value = s.nickname || "";
            nickInput.style.display = editingMode ? 'block' : 'none';
            nickInput.oninput = (e) => s.nickname = e.target.value;
            
            let title = document.createElement('div');
            title.className = 'team-slot-title';
            title.textContent = s.name;
            
            let select = document.createElement('select');
            select.className = 'form-select';
            select.style.display = editingMode && s.formas && s.formas.length > 1 ? 'block' : 'none';
            if(s.formas) {
                s.formas.forEach((f, fIdx) => {
                    let opt = document.createElement('option');
                    opt.value = fIdx;
                    opt.textContent = f.name.toUpperCase();
                    if(s.selectedFormIdx === fIdx) opt.selected = true;
                    select.appendChild(opt);
                });
            }
            select.onchange = (e) => {
                s.selectedFormIdx = parseInt(e.target.value);
                updateSprite(s, img);
            };
            
            div.appendChild(star);
            div.appendChild(nickInput);
            div.appendChild(img);
            div.appendChild(title);
            div.appendChild(select);
        } else {
            let img = document.createElement('img');
            img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
            img.style.opacity = "0.5";
            if(editingMode) img.onclick = () => openModal(i);
            
            let txt = document.createElement('div');
            txt.className = 'team-slot-title';
            txt.style.marginTop = '10px';
            txt.textContent = "VAZIO";
            
            div.appendChild(img);
            div.appendChild(txt);
        }
        
        container.appendChild(div);
    }
}

function updateSprite(slot, imgElement) {
    let form = slot.formas[slot.selectedFormIdx];
    slot.spriteUrl = slot.isShiny ? form.spriteUrlShiny : form.spriteUrl;
    imgElement.src = slot.spriteUrl;
}

let timeAntesDaEdicao = null;

function visualizarTime(idx) {
    currentIndex = idx;
    let t = times[idx];
    document.getElementById('teamName').value = t.nome;
    document.getElementById('trainerNameInput').value = t.trainerName || "";
    updateTrainerPreview(t.trainerName || "");
    document.getElementById('gameSelect').value = t.gameLogo || "";
    currentTeamSlots = JSON.parse(JSON.stringify(t.slots));
    
    document.getElementById('panelTitle').textContent = "Visualizar Time";
    
    setEditingMode(false);
    if (window.innerWidth <= 768) {
        document.getElementById('infoPanel').scrollIntoView({ behavior: 'smooth' });
    }
}

function iniciarEdicao() {
    if(!editingMode) {
        // Entrando em edição
        timeAntesDaEdicao = JSON.stringify({ 
            nome: document.getElementById('teamName').value, 
            trainerName: document.getElementById('trainerNameInput').value,
            gameLogo: document.getElementById('gameSelect').value,
            slots: currentTeamSlots 
        });
        setEditingMode(true);
        document.getElementById('panelTitle').textContent = "Editar Time";
    } else {
        // Cancelando edição
        let ant = JSON.parse(timeAntesDaEdicao);
        document.getElementById('teamName').value = ant.nome;
        document.getElementById('trainerNameInput').value = ant.trainerName || "";
        updateTrainerPreview(ant.trainerName || "");
        document.getElementById('gameSelect').value = ant.gameLogo || "";
        currentTeamSlots = ant.slots;
        setEditingMode(false);
        document.getElementById('panelTitle').textContent = "Visualizar Time";
    }
}

function setEditingMode(isEditing) {
    editingMode = isEditing;
    document.getElementById('teamName').disabled = !isEditing;
    document.getElementById('trainerNameInput').disabled = !isEditing;
    document.getElementById('gameSelect').disabled = !isEditing;
    
    // Switch buttons based on mode. 
    // Se isEditing e currentIndex for -1, é NOVO.
    // Se isEditing e currentIndex >= 0, é EDITANDO EXISTENTE.
    document.getElementById('editorButtons').style.display = isEditing ? 'flex' : 'none';
    document.getElementById('viewButtons').style.display = isEditing ? 'none' : 'flex';
    
    // Renomeia botão de salvar de acordo com o contexto
    if(isEditing && currentIndex >= 0) {
        document.getElementById('editorButtons').children[0].textContent = "SALVAR ALTERAÇÕES";
        document.getElementById('editorButtons').children[1].textContent = "CANCELAR EDICAO";
        document.getElementById('editorButtons').children[1].onclick = iniciarEdicao;
    } else if (isEditing) {
        document.getElementById('editorButtons').children[0].textContent = "SALVAR NOVO";
        document.getElementById('editorButtons').children[1].textContent = "LIMPAR";
        document.getElementById('editorButtons').children[1].onclick = novoTime;
    }
    
    renderSlots();
}

function novoTime() {
    currentIndex = -1;
    currentTeamSlots = [null, null, null, null, null, null];
    document.getElementById('teamName').value = "";
    document.getElementById('trainerNameInput').value = "";
    updateTrainerPreview("");
    document.getElementById('gameSelect').value = "";
    document.getElementById('panelTitle').textContent = "Novo Time";
    setEditingMode(true);
}

async function salvarTimeAtual() {
    let nomeTime = document.getElementById('teamName').value.trim();
    if(!nomeTime) { showToast("Dê um nome ao time!"); return; }
    
    if(currentTeamSlots.every(s => s === null)) {
        showToast("Seu time está vazio!", "error");
        return;
    }
    
    let tName = document.getElementById('trainerNameInput').value.trim();
    let gLogo = document.getElementById('gameSelect').value;
    
    let tObj = {
        nome: nomeTime,
        trainerName: tName,
        gameLogo: gLogo,
        slots: currentTeamSlots
    };
    
    if(currentIndex === -1) {
        times.push(tObj);
        currentIndex = times.length - 1; // Seleciona o recem criado
    } else {
        times[currentIndex] = tObj;
    }
    
    await fetch('/api/usuario/times', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(times)
    });
    
    renderizarTimesList();
    visualizarTime(currentIndex);
}

async function excluirTime() {
    if(currentIndex === -1) return;
    if(confirm("Tem certeza que deseja excluir este time?")) {
        times.splice(currentIndex, 1);
        await fetch('/api/usuario/times', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(times)
        });
        renderizarTimesList();
        novoTime();
    }
}

let hofConfig = {
    trainerImgVisible: true,
    trainerNameVisible: true,
    gameLogoVisible: true,
    trainerImgUrl: '',
    bgTheme: 'default',
    pokemonConfigs: []
};

const trainerImages = ['images/trainer_default.png']; // can add more

const gameLogos = {
    "red": "https://img.pokemondb.net/boxes/red.jpg",
    "blue": "https://img.pokemondb.net/boxes/blue.jpg",
    "yellow": "https://img.pokemondb.net/boxes/yellow.jpg",
    "gold": "https://img.pokemondb.net/boxes/gold.jpg",
    "silver": "https://img.pokemondb.net/boxes/silver.jpg",
    "crystal": "https://img.pokemondb.net/boxes/crystal.jpg",
    "ruby": "https://img.pokemondb.net/boxes/ruby.jpg",
    "sapphire": "https://img.pokemondb.net/boxes/sapphire.jpg",
    "emerald": "https://img.pokemondb.net/boxes/emerald.jpg",
    "firered": "https://img.pokemondb.net/boxes/firered.jpg",
    "leafgreen": "https://img.pokemondb.net/boxes/leafgreen.jpg",
    "diamond": "https://img.pokemondb.net/boxes/diamond.jpg",
    "pearl": "https://img.pokemondb.net/boxes/pearl.jpg",
    "platinum": "https://img.pokemondb.net/boxes/platinum.jpg",
    "heartgold": "https://img.pokemondb.net/boxes/heartgold.jpg",
    "soulsilver": "https://img.pokemondb.net/boxes/soulsilver.jpg",
    "black": "https://img.pokemondb.net/boxes/black.jpg",
    "white": "https://img.pokemondb.net/boxes/white.jpg",
    "black2": "https://img.pokemondb.net/boxes/black-2.jpg",
    "white2": "https://img.pokemondb.net/boxes/white-2.jpg",
    "x": "https://img.pokemondb.net/boxes/x.jpg",
    "y": "https://img.pokemondb.net/boxes/y.jpg",
    "omegaruby": "https://img.pokemondb.net/boxes/omega-ruby.jpg",
    "alphasapphire": "https://img.pokemondb.net/boxes/alpha-sapphire.jpg",
    "sun": "https://img.pokemondb.net/boxes/sun.jpg",
    "moon": "https://img.pokemondb.net/boxes/moon.jpg",
    "ultrasun": "https://img.pokemondb.net/boxes/ultra-sun.jpg",
    "ultramoon": "https://img.pokemondb.net/boxes/ultra-moon.jpg",
    "sword": "https://img.pokemondb.net/boxes/sword.jpg",
    "shield": "https://img.pokemondb.net/boxes/shield.jpg",
    "brilliantdiamond": "https://img.pokemondb.net/boxes/brilliant-diamond.jpg",
    "shiningpearl": "https://img.pokemondb.net/boxes/shining-pearl.jpg",
    "legendsarceus": "https://img.pokemondb.net/boxes/legends-arceus.jpg",
    "scarlet": "https://img.pokemondb.net/boxes/scarlet.jpg",
    "violet": "https://img.pokemondb.net/boxes/violet.jpg"
};

function hallOfFame() {
    let tObj = times[currentIndex];
    if(!tObj) return;
    if(currentTeamSlots.every(s => s === null)) {
        showToast("Seu time está vazio!");
        return;
    }
    
    hofConfig.pokemonConfigs = currentTeamSlots.map(s => {
        if(!s) return null;
        let form = s.formas[s.selectedFormIdx];
        let url = s.isShiny ? form.spriteUrlShiny : form.spriteUrl;
        return {
            nameVisible: true,
            spriteUrl: url,
            name: s.nickname && s.nickname.trim() !== "" ? s.nickname : s.name
        };
    });
    
    document.getElementById('hofTrainerName').textContent = loggedUser ? loggedUser.nome : "Treinador";
    
    let hofImg = document.getElementById('hofTrainerImg');
    if(tObj.trainerName && tObj.trainerName.trim() !== "") {
        let tName = tObj.trainerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        hofImg.src = `https://play.pokemonshowdown.com/sprites/trainers/${tName}.png`;
        hofImg.onerror = () => { hofImg.src = 'images/trainer_default.png'; };
        hofConfig.trainerImgUrl = hofImg.src;
    } else {
        hofImg.src = 'images/trainer_default.png';
        hofConfig.trainerImgUrl = hofImg.src;
    }
    hofImg.style.opacity = hofConfig.trainerImgVisible ? '1' : '0';
    
    let gameLogoImg = document.getElementById('hofGameLogo');
    let gameLogoText = document.getElementById('hofGameLogoText');
    if(tObj.gameLogo && gameLogos[tObj.gameLogo]) {
        gameLogoImg.src = gameLogos[tObj.gameLogo];
        gameLogoImg.onerror = () => {
            gameLogoImg.style.display = 'none';
            if(gameLogoText) {
                gameLogoText.textContent = "POKÉMON " + tObj.gameLogo.toUpperCase();
                gameLogoText.style.display = 'block';
                gameLogoText.style.opacity = hofConfig.gameLogoVisible ? '1' : '0';
            }
        };
        gameLogoImg.style.display = 'block';
        gameLogoImg.style.opacity = hofConfig.gameLogoVisible ? '1' : '0';
        if (gameLogoText) gameLogoText.style.display = 'none';
    } else {
        gameLogoImg.style.display = 'none';
        gameLogoImg.src = "";
        if (gameLogoText) gameLogoText.style.display = 'none';
    }
    
    document.getElementById('hofOverlay').style.display = 'flex';
    renderHofTeam();
}

function fecharHof(e) {
    if(e) e.stopPropagation();
    document.getElementById('hofOverlay').style.display = 'none';
}

function changeBgTheme(val) {
    hofConfig.bgTheme = val;
    let filterStr = "";
    switch(val) {
        case 'green': filterStr = "hue-rotate(240deg)"; break;
        case 'red': filterStr = "hue-rotate(130deg)"; break;
        case 'purple': filterStr = "hue-rotate(60deg)"; break;
        case 'yellow': filterStr = "hue-rotate(180deg)"; break;
        case 'cyan': filterStr = "hue-rotate(300deg)"; break;
        case 'black': filterStr = "grayscale(1) brightness(0.3)"; break;
        case 'white': filterStr = "grayscale(1) brightness(1.5)"; break;
        default: filterStr = "hue-rotate(0deg)"; break;
    }
    
    let filterDiv = document.getElementById('bgFilter') || document.getElementById('hofBgFilter');
    if(filterDiv) filterDiv.style.filter = filterStr;
}

function toggleTrainerImg() {
    hofConfig.trainerImgVisible = !hofConfig.trainerImgVisible;
    document.getElementById('hofTrainerImg').style.opacity = hofConfig.trainerImgVisible ? '1' : '0';
}

function toggleGameLogo() {
    hofConfig.gameLogoVisible = !hofConfig.gameLogoVisible;
    document.getElementById('hofGameLogo').style.opacity = hofConfig.gameLogoVisible ? '1' : '0';
    let txt = document.getElementById('hofGameLogoText');
    if(txt) txt.style.opacity = hofConfig.gameLogoVisible ? '1' : '0';
}

function toggleTrainerName() {
    hofConfig.trainerNameVisible = !hofConfig.trainerNameVisible;
    document.getElementById('hofTrainerName').style.opacity = hofConfig.trainerNameVisible ? '1' : '0';
}

function toggleHofPokemonName(idx) {
    if(!hofConfig.pokemonConfigs[idx]) return;
    hofConfig.pokemonConfigs[idx].nameVisible = !hofConfig.pokemonConfigs[idx].nameVisible;
    renderHofTeam();
}

async function changeHofSprite(idx, pokemonId) {
    try {
        let pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        let pData = await pRes.json();
        
        let spriteOptions = [];
        const extractSprites = (obj) => {
            if(!obj) return;
            Object.keys(obj).forEach(k => {
                if(typeof obj[k] === 'string' && obj[k].endsWith('.png')) spriteOptions.push(obj[k]);
                else if(typeof obj[k] === 'object') extractSprites(obj[k]);
            });
        };
        extractSprites(pData.sprites);
        
        // Remove duplicates
        spriteOptions = [...new Set(spriteOptions)];
        
        let menu = document.createElement("div");
        menu.style.position = "fixed";
        menu.style.top = "10%"; menu.style.left = "10%"; menu.style.width = "80%"; menu.style.height = "80%";
        menu.style.background = "#fff"; menu.style.border = "4px solid #000"; menu.style.zIndex = "3000";
        menu.style.overflowY = "auto"; menu.style.padding = "20px"; menu.style.display = "flex";
        menu.style.flexWrap = "wrap"; menu.style.gap = "10px";
        
        let closeBtn = document.createElement("div");
        closeBtn.textContent = "FECHAR";
        closeBtn.style.width = "100%"; closeBtn.style.textAlign = "right"; closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => document.body.removeChild(menu);
        menu.appendChild(closeBtn);
        
        spriteOptions.forEach(url => {
            let img = document.createElement("img");
            img.src = url; img.style.width = "80px"; img.style.cursor = "pointer";
            img.onclick = () => {
                hofConfig.pokemonConfigs[idx].spriteUrl = url;
                renderHofTeam();
                document.body.removeChild(menu);
            };
            menu.appendChild(img);
        });
        
        document.body.appendChild(menu);
    } catch (e) {
        showToast("Erro ao carregar opções de sprite.");
    }
}

function renderHofTeam() {
    let grid = document.getElementById('hofTeamGrid');
    grid.innerHTML = "";
    
    for(let i=0; i<6; i++) {
        let conf = hofConfig.pokemonConfigs[i];
        let div = document.createElement('div');
        div.style.display = "flex"; div.style.flexDirection = "column"; div.style.alignItems = "center";
        
        if(conf) {
            let img = document.createElement('img');
            img.src = conf.spriteUrl;
            img.style.width = "100px"; img.style.height = "100px"; img.style.objectFit = "contain";
            img.style.cursor = "pointer"; img.title = "Clique para trocar a arte";
            img.onclick = () => changeHofSprite(i, currentTeamSlots[i].id);
            
            let name = document.createElement('div');
            name.textContent = conf.name;
            name.style.fontFamily = "'Press Start 2P', cursive";
            name.style.fontSize = "0.5rem";
            name.style.color = "white";
            name.style.textShadow = "1px 1px 0 #000";
            name.style.marginTop = "5px";
            name.style.cursor = "pointer";
            name.title = "Clique para ocultar/mostrar";
            name.style.opacity = conf.nameVisible ? '1' : '0';
            name.onclick = () => toggleHofPokemonName(i);
            
            div.appendChild(img);
            div.appendChild(name);
        }
        grid.appendChild(div);
    }
}

async function exportHof() {
    let tObj = times[currentIndex];
    
    let dataToExport = {
        bgTheme: hofConfig.bgTheme || 'default',
        trainerImg: hofConfig.trainerImgUrl || document.getElementById('hofTrainerImg').src,
        trainerImgVisible: hofConfig.trainerImgVisible,
        trainerName: document.getElementById('hofTrainerName').textContent,
        trainerNameVisible: hofConfig.trainerNameVisible,
        gameLogoUrl: tObj && tObj.gameLogo ? gameLogos[tObj.gameLogo] : "",
        gameLogoName: tObj && tObj.gameLogo ? "POKÉMON " + tObj.gameLogo.toUpperCase() : "",
        gameLogoVisible: hofConfig.gameLogoVisible,
        pokemons: hofConfig.pokemonConfigs
    };
    
    let jsonStr = JSON.stringify(dataToExport);
    let base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    let link = window.location.origin + "/hall-da-fama?data=" + base64;
    
    try {
        await navigator.clipboard.writeText(link);
        showToast("Link copiado para a área de transferência!", "success");
    } catch(err) {
        showToast("Erro ao copiar link.");
    }
}

/* MODAL LOGIC */
function openModal(slotIdx) {
    modalTargetSlot = slotIdx;
    document.getElementById('searchModal').style.display = 'flex';
    document.getElementById('modalSearch').value = "";
    filtrarModal();
}

function fecharModal() {
    document.getElementById('searchModal').style.display = 'none';
}

function filtrarModal() {
    let filter = document.getElementById('modalSearch').value.toUpperCase();
    let ul = document.getElementById("modalList");
    ul.innerHTML = "";
    
    let count = 0;
    for(let i=0; i<globalPokedexList.length; i++) {
        let p = globalPokedexList[i];
        if(p.nome.toUpperCase().indexOf(filter) > -1) {
            let li = document.createElement("li");
            let img = document.createElement("img");
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
            let span = document.createElement("span");
            span.textContent = p.nome;
            li.appendChild(img);
            li.appendChild(span);
            li.onclick = () => selectPokemonForSlot(p.nome);
            ul.appendChild(li);
        }
    }
}

async function selectPokemonForSlot(nome) {
    fecharModal();
    try {
        let res = await fetch(`/api/pokemon/${nome.toLowerCase()}`);
        let data;
        
        if (res.ok) {
            data = await res.json();
            // Verifica backup (times não exibe dados detalhados, mas para manter consistência)
            let desatualizado = true;
            if (data.dataBackup) {
                let backupDate = new Date(data.dataBackup);
                let diffDays = Math.ceil(Math.abs(new Date() - backupDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 30) desatualizado = false;
            }
            if(desatualizado) {
                showToast("Atualizando dados da PokéAPI (30+ dias)...", "success");
                data = await fetchPokemonFromPokeAPIAndSave(nome.toLowerCase(), null);
            }
        } else {
            showToast("Baixando dados do Pokémon da nuvem...", "success");
            data = await fetchPokemonFromPokeAPIAndSave(nome.toLowerCase(), null);
        }
        
        let formasList = JSON.parse(data.formas || "[]");
        let baseForms = formasList.filter(f => f.type !== 'shiny');
        let shinyForm = formasList.find(f => f.type === 'shiny');
        
        let customForms = baseForms.map(f => {
            return {
                name: f.name,
                spriteUrl: f.spriteUrl,
                spriteUrlShiny: f.spriteUrlShiny || ((f.type === 'normal' && shinyForm) 
                    ? shinyForm.spriteUrl 
                    : (f.spriteUrl ? f.spriteUrl.replace("/pokemon/", "/pokemon/shiny/") : ""))
            }
        });

        currentTeamSlots[modalTargetSlot] = {
            id: data.id,
            name: nome,
            nickname: "",
            isShiny: false,
            selectedFormIdx: 0,
            formas: customForms
        };
        
        // Garante que a url shiny da variante exista. Fallback se n existir.
        currentTeamSlots[modalTargetSlot].formas.forEach(f => {
            if(!f.spriteUrlShiny) f.spriteUrlShiny = f.spriteUrl;
        });
        
        updateSprite(currentTeamSlots[modalTargetSlot], {src:''});
        renderSlots();

    } catch(err) {
        showToast("Ocorreu um erro ao carregar o Pokémon da API.");
    }
}

document.addEventListener("DOMContentLoaded", initApp);
