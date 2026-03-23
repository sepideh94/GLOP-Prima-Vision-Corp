package com.ciblorgasport.spectator.domain;

import java.util.ArrayList;
import java.util.List;

import com.ciblorgasport.storage.domain.Document;
import com.ciblorgasport.user.domain.UserAccount;

import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Builder;
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

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(
            name = "spectator_ticket_documents",
            joinColumns = @JoinColumn(name = "spectator_id"),
            inverseJoinColumns = @JoinColumn(name = "document_id"))
    @Builder.Default
    private List<Document> ticketDocuments = new ArrayList<>();

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