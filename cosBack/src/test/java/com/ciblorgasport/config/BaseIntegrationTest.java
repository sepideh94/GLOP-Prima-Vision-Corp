package com.ciblorgasport.config;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Classe de base abstraite pour tous les tests d'intégration nécessitant une base de données.
 * Utilise Testcontainers pour démarrer un conteneur PostgreSQL réel.
 * * Le conteneur est marqué comme 'static' est partagé entre tous les tests de la suite,
 * ce qui améliore grandement la vitesse d'exécution.
 */
@Testcontainers
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class BaseIntegrationTest {


    @Container
    public static PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:16.1")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpassword");
    
    
}
