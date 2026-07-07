function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('open');
}

async function carregarUsuarios() {
    try {
        let res = await fetch('/api/admin/users');
        if(!res.ok) { window.location.href='/'; return; }
        let users = await res.json();
        renderTable(users);
    } catch(e) {
        console.error("Sem permissão ou erro de comunicação:", e);
    }
}

function renderTable(users) {
    let tbody = document.querySelector("#usersTable tbody");
    tbody.innerHTML = "";
    users.forEach(u => {
        let tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${u.id}</td>
            <td><input type="text" class="admin-input" id="nome_${u.id}" value="${u.nome}"></td>
            <td><input type="email" class="admin-input" id="email_${u.id}" value="${u.email}"></td>
            <td><input type="text" class="admin-input" id="senha_${u.id}" value="${u.senha}"></td>
            <td>
                <select class="admin-input" id="admin_${u.id}">
                    <option value="false" ${!u.admin ? 'selected' : ''}>Não</option>
                    <option value="true" ${u.admin ? 'selected' : ''}>Sim</option>
                </select>
            </td>
            <td style="text-align: center;"><button class="admin-btn" onclick="salvarUsuario(${u.id})">SALVAR</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function salvarUsuario(id) {
    let dados = {
        nome: document.getElementById('nome_'+id).value,
        email: document.getElementById('email_'+id).value,
        senha: document.getElementById('senha_'+id).value,
        admin: document.getElementById('admin_'+id).value === 'true'
    };
    
    try {
        let res = await fetch('/api/admin/users/'+id, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if(res.ok) {
            showToast("Usuário atualizado com sucesso!", "success");
            carregarUsuarios();
        } else {
            showToast("Erro ao atualizar usuário. Verifique suas permissões.");
        }
    } catch(e) {
        showToast("Erro de comunicação com o servidor.");
    }
}

async function limparCacheAPI() {
    if(confirm("Isso forçará a Dexio a buscar dados novos da PokeAPI na próxima vez que cada Pokémon for visualizado. Continuar?")) {
        try {
            let res = await fetch('/api/admin/resetBackup', { method: 'POST' });
            if(res.ok) {
                showToast("Cache das datas de backup limpo com sucesso!", "success");
            } else {
                showToast("Falha ao limpar o cache.");
            }
        } catch(e) {
            showToast("Erro de conexão.");
        }
    }
}

document.addEventListener("DOMContentLoaded", carregarUsuarios);
