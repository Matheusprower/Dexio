let offset = 0;
const limit = 20;
let carregando = false;

function carregarPokemons() {
    if (carregando) return;

    carregando = true;

    fetch(`/api/pokemons?offset=${offset}&limit=${limit}`)
        .then(res => res.json())
        .then(data => {
            const lista = document.getElementById("lista");

            data.forEach((pokemon, index) => {
    const li = document.createElement("li");

    const img = document.createElement("img");

    const id = offset + index + 1;

    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    const nome = document.createElement("span");
    nome.textContent = pokemon.name;

    li.appendChild(img);
    li.appendChild(nome);

    lista.appendChild(li);
});

            offset += limit;
            carregando = false;
        });
}

window.addEventListener("scroll", () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
    ) {
        carregarPokemons();
    }
});

carregarPokemons();