package com.ciblorgasport.notification.domain;

public enum NotificationType {
	ACCREDITATION_VALIDATED,
	ACCREDITATION_REFUSED,
	ACCREDITATION_SUBMITTED,
	PARTICIPATION_SUBMITTED,
	PARTICIPATION_VALIDATED,
	PARTICIPATION_REFUSED,
	TEAM_PARTICIPATION_VALIDATED,
	INCIDENT,
	/** Classement / résultats publiés pour une épreuve d'une compétition suivie */
	COMPETITION_RESULTS
}