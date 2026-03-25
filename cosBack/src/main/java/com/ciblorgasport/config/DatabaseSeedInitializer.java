package com.ciblorgasport.config;

import javax.sql.DataSource;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DatabaseSeedInitializer implements ApplicationRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                    "select count(*) from user_account",
                    Integer.class
            );

            if (count != null && count > 0) {
                log.info("Seed ignoré : la table user_account contient déjà des données.");
                return;
            }

            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.setContinueOnError(false);
            populator.setIgnoreFailedDrops(true);
            populator.addScript(new ClassPathResource("db/V300_seed.sql"));
            populator.execute(dataSource);

            log.info("Seed SQL exécuté avec succès : db/V300_seed.sql");
        } catch (Exception e) {
            log.error("Erreur pendant l'exécution du seed SQL", e);
        }
    }
}