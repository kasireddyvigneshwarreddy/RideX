package com.bitlyclone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long clickCount;
    private Map<String, Long> browserStats;
    private Map<String, Long> deviceStats;
    private Map<String, Long> countryStats;
    private LocalDateTime creationDate;
    private LocalDateTime expiryDate;
    private LocalDateTime lastClicked;
}
