package com.ciblorgasport.common.service;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class CsvImportService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
    private static final String CSV_TYPE = "text/csv";
    private static final String EXCEL_TYPE = "application/vnd.ms-excel";

    /**
     * Parse un fichier CSV et retourne la liste des enregistrements.
     * Gère la détection automatique du délimiteur (, ou ;).
     */
    public List<CSVRecord> parseCsv(MultipartFile file) throws Exception {
        
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Le fichier est trop volumineux. La taille maximale autorisée est de 5 Mo.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals(CSV_TYPE) && !contentType.equals(EXCEL_TYPE))) {
        }

        byte[] preview = file.getInputStream().readNBytes(1024);
        String previewContent = new String(preview, StandardCharsets.UTF_8);
        char delimiter = previewContent.contains(";") ? ';' : ',';

        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setDelimiter(delimiter)
                    .setHeader() 
                    .setSkipHeaderRecord(true)
                    .setIgnoreHeaderCase(true)
                    .setTrim(true)
                    .build();

            try (CSVParser csvParser = new CSVParser(reader, format)) {
                return csvParser.getRecords();
            }
        }
    }
}
