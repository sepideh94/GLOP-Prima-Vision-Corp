package com.ciblorgasport.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.documents.enabled", havingValue = "true")
public class S3DocumentSeedInitializer implements ApplicationRunner {

    private final S3Client s3Client;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Override
    public void run(ApplicationArguments args) {
        try {
            ensureBucketExists();
            uploadSeedDocumentsIfMissing();
            log.info("Seed S3 documents exécuté avec succès.");
        } catch (Exception e) {
            log.error("Erreur pendant le seed S3 documents", e);
        }
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("Bucket déjà existant : {}", bucketName);
        } catch (S3Exception e) {
            try {
                s3Client.createBucket(b -> b.bucket(bucketName));
                log.info("Bucket créé : {}", bucketName);
            } catch (Exception ex) {
                log.info("Bucket probablement déjà créé ou non créable automatiquement : {}", bucketName);
            }
        }
    }

    private void uploadSeedDocumentsIfMissing() {
        List<String> files = List.of(
                "seed/commissionner_amina_badji_accreditation.pdf",
                "seed/commissionner_thomas_mercier_accreditation.pdf",
                "seed/athlete_lina_haddad_passport.pdf",
                "seed/athlete_lina_haddad_medical.pdf",
                "seed/athlete_nora_azizi_passport.pdf",
                "seed/athlete_nora_azizi_medical.pdf",
                "seed/athlete_ines_benali_passport.pdf",
                "seed/athlete_ines_benali_medical.pdf",
                "seed/athlete_sarah_abbas_passport.pdf",
                "seed/athlete_sarah_abbas_medical.pdf",
                "seed/athlete_camille_moreau_passport.pdf",
                "seed/athlete_camille_moreau_medical.pdf",
                "seed/athlete_zoe_laurent_passport.pdf",
                "seed/athlete_zoe_laurent_medical.pdf",
                "seed/athlete_yanis_cherif_passport.pdf",
                "seed/athlete_yanis_cherif_medical.pdf",
                "seed/athlete_adam_rahimi_passport.pdf",
                "seed/athlete_adam_rahimi_medical.pdf",
                "seed/athlete_louis_perrin_passport.pdf",
                "seed/athlete_louis_perrin_medical.pdf",
                "seed/athlete_hugo_martin_passport.pdf",
                "seed/athlete_hugo_martin_medical.pdf",
                "seed/athlete_noa_diallo_passport.pdf",
                "seed/athlete_noa_diallo_medical.pdf",
                "seed/athlete_lena_rossi_passport.pdf",
                "seed/athlete_lena_rossi_medical.pdf",
                "seed/athlete_rayan_kaci_passport.pdf",
                "seed/athlete_rayan_kaci_medical.pdf",
                "seed/athlete_ines_boukari_passport.pdf",
                "seed/athlete_ines_boukari_medical.pdf",
                "seed/spectator_sophie_martin_ticket.pdf",
                "seed/spectator_karim_haddou_ticket.pdf",
                "seed/spectator_claire_dubois_ticket.pdf"
        );

        byte[] pdf = """
                %PDF-1.4
                1 0 obj<<>>endobj
                trailer<<>>
                %%EOF
                """.getBytes(StandardCharsets.UTF_8);

        for (String key : files) {
            if (!objectExists(key)) {
                s3Client.putObject(
                        PutObjectRequest.builder()
                                .bucket(bucketName)
                                .key(key)
                                .contentType("application/pdf")
                                .build(),
                        RequestBody.fromBytes(pdf)
                );
                log.info("Document seed créé : {}", key);
            }
        }
    }

    private boolean objectExists(String key) {
        try {
            s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build()
            );
            return true;
        } catch (S3Exception e) {
            return false;
        }
    }
}