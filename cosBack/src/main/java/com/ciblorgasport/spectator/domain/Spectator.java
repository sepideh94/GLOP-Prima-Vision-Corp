package com.ciblorgasport.spectator.domain;

import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "spectator")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@DiscriminatorValue("SPECTATOR")
public class Spectator extends UserAccount {

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "ticket_document_id")
    private Document ticketDocument;

    @Override
    public String getRoleName() {
        return "ROLE_SPECTATOR";
    }

    @Override
    public boolean isEnabled() {
        return isActive();
    }

    public boolean isSpectator() {
        return true;
    }
}