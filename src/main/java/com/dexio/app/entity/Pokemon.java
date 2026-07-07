package com.dexio.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "pokemon")
@Data
public class Pokemon {
    @Id
    private Long id;

    @Column(unique = true)
    private String nome;

    private String spriteUrl;

    private String tipos;
    
    private String eggGroups;

    @Column(columnDefinition = "TEXT")
    private String evolutionChain;

    @Column(columnDefinition = "TEXT")
    private String locaisCaptura;

    @Column(columnDefinition = "TEXT")
    private String ataques;

    @Column(columnDefinition = "TEXT")
    private String formas; // Formas alternativas (JSON)
    
    private Boolean detalhesCarregados = false;

    @Column(name = "data_backup")
    private java.time.LocalDate dataBackup;
}
