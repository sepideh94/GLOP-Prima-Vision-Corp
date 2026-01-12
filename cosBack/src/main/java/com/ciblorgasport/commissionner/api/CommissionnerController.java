package com.ciblorgasport.commissionner.api;

import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ciblorgasport.athlete.application.AthleteCreationService;
import com.ciblorgasport.common.service.CsvImportService;
import com.ciblorgasport.volonteer.application.VolonteerCreationService; // Nouveau service à importer
import com.ciblorgasport.user.application.UserAccountService;
import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/commissioner")
@RequiredArgsConstructor
public class CommissionnerController {
	
	@Autowired
    private final AthleteCreationService athleteService; 
	
	@Autowired
    private final VolonteerCreationService volontaireService; 
	
	@Autowired
	private final UserAccountService userAccountService;
	
	@Autowired
	private final CsvImportService csvService;

    @PostMapping("/create-athlete")
    public ResponseEntity<?> createAthlete(@RequestBody CreateUserRequest request) {
        UserAccount created = athleteService.createUser(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "") 
            )
        );
    }
    
    @PostMapping("/create-volonteer")
    public ResponseEntity<?> createVolonteer(@RequestBody CreateUserRequest request) {
        
        UserAccount created = volontaireService.createUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of(
              "id", created.getId(),
              "email", created.getEmail(),
              "role", created.getRoleName().replace("ROLE_", "") 
            )
        );
    }
    
    @PostMapping("/import-athletes")
    public ResponseEntity<?> importAthletes(@RequestParam("file") MultipartFile file) throws Exception {
        List<CSVRecord> records = csvService.parseCsv(file);
        records.forEach(r -> userAccountService.createAndInviteUser(r, athleteService));
        return ResponseEntity.ok("Import athlètes terminé");
    }
    
    @PostMapping("/import-volonteers")
    public ResponseEntity<?> importVolonteers(@RequestParam("file") MultipartFile file) throws Exception {
        List<CSVRecord> records = csvService.parseCsv(file);
        records.forEach(r -> userAccountService.createAndInviteUser(r, volontaireService));
        return ResponseEntity.ok("Import volontaires terminé");
    }
    
}