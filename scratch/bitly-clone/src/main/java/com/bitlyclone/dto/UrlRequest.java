package com.bitlyclone.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.URL;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlRequest {

    @NotBlank(message = "Destination URL is required")
    @URL(message = "Invalid URL format")
    private String longUrl;

    private String customAlias;

    private String title;

    private LocalDateTime expiryDate;
}
