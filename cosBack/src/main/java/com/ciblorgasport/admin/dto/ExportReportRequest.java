package com.ciblorgasport.admin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExportReportRequest {
    // Liste des images des graphiques en Base64
    private List<String> chartImagesBase64; 
}