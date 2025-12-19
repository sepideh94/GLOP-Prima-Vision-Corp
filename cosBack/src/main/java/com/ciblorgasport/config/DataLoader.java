package com.ciblorgasport.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ciblorgasport.round.domain.Round;
import com.ciblorgasport.round.domain.RoundName;
import com.ciblorgasport.round.infrastructure.RoundRepository;
import com.ciblorgasport.site.domain.Site;
import com.ciblorgasport.site.infrastructure.SiteRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            SiteRepository siteRepository,
            RoundRepository roundRepository) {
        return args -> {
            // Initialize Sites
            if (siteRepository.count() == 0) {
                log.info("Initializing database with default sites...");

                Site site1 = new Site();
                site1.setAdress("Piscine Olympique Jean Bouin, 30 Avenue du Stade, 75016 Paris, France");
                site1.setLatitude(48.8415);
                site1.setLongitude(2.2534);
                siteRepository.save(site1);
                log.info("Created site: {}", site1.getAdress());

                Site site2 = new Site();
                site2.setAdress("Centre Aquatique Olympique de Saint-Denis, 1 Rue du Général Cochet, 93200 Saint-Denis, France");
                site2.setLatitude(48.9275);
                site2.setLongitude(2.3601);
                siteRepository.save(site2);
                log.info("Created site: {}", site2.getAdress());

                log.info("Database initialization: {} sites created.", siteRepository.count());
            } else {
                log.info("Database already contains {} sites. Skipping site initialization.", siteRepository.count());
            }

            // Note: Competition creation skipped - requires parentEvent (Event entity)
            // Competitions should be created through the Event management workflow
            log.info("Competition initialization skipped - requires Event parent entity");

            // Initialize Rounds - one unique round per type
            if (roundRepository.count() == 0) {
                log.info("Initializing database with unique rounds...");

                Round qualificationHeat = new Round();
                qualificationHeat.setName(RoundName.QUALIFICATION_HEAT);
                roundRepository.save(qualificationHeat);
                log.info("Created round: {}", qualificationHeat.getDisplayName());

                Round round16 = new Round();
                round16.setName(RoundName.HUITIEMES_DE_FINALE);
                roundRepository.save(round16);
                log.info("Created round: {}", round16.getDisplayName());

                Round quarterFinal = new Round();
                quarterFinal.setName(RoundName.QUART_DE_FINALE);
                roundRepository.save(quarterFinal);
                log.info("Created round: {}", quarterFinal.getDisplayName());

                Round semiFinal = new Round();
                semiFinal.setName(RoundName.DEMI_FINALE);
                roundRepository.save(semiFinal);
                log.info("Created round: {}", semiFinal.getDisplayName());

                Round finalRound = new Round();
                finalRound.setName(RoundName.FINALE);
                roundRepository.save(finalRound);
                log.info("Created round: {}", finalRound.getDisplayName());

                Round extraPhase = new Round();
                extraPhase.setName(RoundName.PHASE_SUPPLEMENTAIRE);
                roundRepository.save(extraPhase);
                log.info("Created round: {}", extraPhase.getDisplayName());

                log.info("Database initialization: {} unique rounds created.", roundRepository.count());
            } else {
                log.info("Database already contains {} rounds. Skipping round initialization.", roundRepository.count());
            }

            log.info("Database initialization completed successfully!");
        };
    }
}
