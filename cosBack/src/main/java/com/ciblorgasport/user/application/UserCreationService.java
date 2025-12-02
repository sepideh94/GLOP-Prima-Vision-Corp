package com.ciblorgasport.user.application;

import com.ciblorgasport.user.domain.UserAccount;
import com.ciblorgasport.user.dto.CreateUserRequest;

public interface UserCreationService {
	
	/**
     * Crée et sauvegarde une nouvelle instance de UserAccount.
     * @param request les données de l'utilisateur.
     * @return L'entité UserAccount concrète et persistée (ex: Commissionner).
     */
    UserAccount createUser(CreateUserRequest request);
}
