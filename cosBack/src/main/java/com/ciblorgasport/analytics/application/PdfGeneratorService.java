package com.ciblorgasport.analytics.application;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generatePdfReport(String reportContent) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("CiblOrgaSport - Rapport Administratif\n", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);

            String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            Paragraph datePara = new Paragraph("Généré le : " + date + "\n\n");
            datePara.setAlignment(Paragraph.ALIGN_RIGHT);
            document.add(datePara);

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Paragraph body = new Paragraph(reportContent, bodyFont);
            document.add(body);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}