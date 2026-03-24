package com.ciblorgasport.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChartPointResponse {
    private String label; // La date (ex: "15/03")
    private long value;   // Le nombre d'actions
}