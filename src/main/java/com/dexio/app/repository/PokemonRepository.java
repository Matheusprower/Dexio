package com.dexio.app.repository;

import com.dexio.app.entity.Pokemon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PokemonRepository extends JpaRepository<Pokemon, Long> {
    Optional<Pokemon> findByNome(String nome);
    
    @Modifying
    @Transactional
    @Query("UPDATE Pokemon p SET p.dataBackup = null")
    void resetAllBackups();
}
