package com.ciblorgasport.analytics.application;

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

	public byte[] generatePdfReport(String reportContent, List<byte[]> chartImages) {
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
	        String content = (reportContent != null) ? reportContent : "Aucune analyse disponible.";
	        Paragraph body = new Paragraph(content, bodyFont);
	        document.add(body);

	        if (chartImages != null && !chartImages.isEmpty()) {
	            for (byte[] imageData : chartImages) {
	                try {
	                    Image img = Image.getInstance(imageData);
	                    img.scaleToFit(500, 300); 
	                    img.setSpacingBefore(20f);
	                    img.setAlignment(Image.ALIGN_CENTER); 
	                    document.add(img);
	                } catch (Exception e) {
	                    document.add(new Paragraph("\n[Erreur lors du rendu d'un graphique]"));
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