package com.dexio.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Boolean admin = false;

    @Column(columnDefinition = "TEXT")
    private String capturas; // JSON

    @Column(columnDefinition = "TEXT")
    private String times; // JSON
}
