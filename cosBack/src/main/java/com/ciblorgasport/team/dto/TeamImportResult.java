package com.ciblorgasport.team.dto;

/**
 * Résultat de l'importation des équipes.
 */
public record TeamImportResult(int teamsProcessed, int athletesCreated, int skippedLines) {}