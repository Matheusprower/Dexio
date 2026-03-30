package com.dexio.app.dto;

import java.util.List;

public class PokemonResposta {
    private List<Pokemon> results;

    public List<Pokemon> getResults() {
        return results;
    }

    public void setResults(List<Pokemon> results) {
        this.results = results;
    }

}