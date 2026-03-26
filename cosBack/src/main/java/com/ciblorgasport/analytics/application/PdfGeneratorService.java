package com.ciblorgasport.analytics.application;

import com.ciblorgasport.admin.dto.AdminStatsResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PdfGeneratorService {

	public byte[] generatePdfReport(AdminStatsResponse stats, List<byte[]> chartImages) {
	    ByteArrayOutputStream out = new ByteArrayOutputStream();
	    Document document = new Document();
	    
	    try {
	        PdfWriter.getInstance(document, out);
	        document.open();

	        // --- EN-TÊTE ---
	        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
	        Paragraph title = new Paragraph("CiblOrgaSport - Rapport Décisionnel\n", titleFont);
	        title.setAlignment(Paragraph.ALIGN_CENTER);
	        document.add(title);

	        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
	        document.add(new Paragraph("Généré le : " + date + "\n\n"));

	        // --- SECTION 1 : ACTIVITÉ & ENGAGEMENT (Axe 7) ---
	        document.add(new Paragraph("1. ANALYSE DE L'ACTIVITÉ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
	        document.add(new Paragraph("Nombre total de connexions (semaine) : " + stats.getTotalLoginsWeek()));
	        document.add(new Paragraph("Temps de session moyen par rôle :"));
	        
	        stats.getAverageSessionByRole().forEach((role, duration) -> {
	            try {
	                document.add(new Paragraph("   - " + role + " : " + String.format("%.1f", duration) + " min"));
	            } catch (Exception e) {}
	        });

	        // --- SECTION 2 : SÉCURITÉ & PILOTAGE ---
	        document.add(new Paragraph("\n2. ÉTAT DE LA SÉCURITÉ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
	        document.add(new Paragraph("Nouveaux incidents : " + stats.getTotalIncidentsWeek()));
	        document.add(new Paragraph("Taux de résolution : " + String.format("%.1f", stats.getIncidentResolutionRate()) + "%"));

	        // --- SECTION 3 : ÉCO-CONCEPTION (Axe 8) ---
	        document.add(new Paragraph("\n3. ANALYSE ÉCO-CONCEPTION", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
	        document.add(new Paragraph("Top des sections les plus consultées (Volume de données) :"));
	        stats.getTopViewedSections().forEach((section, count) -> {
	            try {
	                document.add(new Paragraph("   - " + section + " : " + count + " vues"));
	            } catch (Exception e) {}
	        });

	        // --- SECTION 4 : VISUELS (GRAPHES ENVOYÉS PAR LE FRONT) ---
	        if (chartImages != null && !chartImages.isEmpty()) {
	            document.add(new Paragraph("\n4. VISUALISATIONS GRAPHIQUES", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
	            for (byte[] imageData : chartImages) {
	                try {
	                    Image img = Image.getInstance(imageData);
	                    img.scaleToFit(450, 250);
	                    img.setAlignment(Image.ALIGN_CENTER);
	                    img.setSpacingBefore(15f);
	                    document.add(img);
	                } catch (Exception e) {
	                    document.add(new Paragraph("[Erreur rendu graphique]"));
	                }
	            }
	        }

	        document.close();
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	    return out.toByteArray();
	}
}