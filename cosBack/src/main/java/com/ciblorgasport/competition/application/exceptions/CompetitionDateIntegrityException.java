package com.ciblorgasport.competition.application.exceptions;


/**
 * Exception levée lorsque les règles de date d'intégrité de la compétition
 * sont violées (par exemple, date de fin < date de début, ou date de début < événement parent).
 */
public class CompetitionDateIntegrityException extends IllegalArgumentException {

	public CompetitionDateIntegrityException(String message) {
        super(message);
    }
}