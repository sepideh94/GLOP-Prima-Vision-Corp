package com.ciblorgasport.commissionner;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

@Data
public class AccreditationRequest {
    private MultipartFile file;
}