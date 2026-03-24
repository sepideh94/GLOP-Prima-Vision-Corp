package com.ciblorgasport.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SectionVisitCountView implements SectionVisitCount {
    private final String section;
    private final Long visitCount;
}
