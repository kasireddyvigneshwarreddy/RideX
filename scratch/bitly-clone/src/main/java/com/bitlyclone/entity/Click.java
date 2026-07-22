package com.bitlyclone.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clicks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Click {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;

    private String browser;

    private String operatingSystem;

    private String device;

    private String ipAddress;

    private String country;

    private String city;

    private String referer;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    @PrePersist
    protected void onPersist() {
        this.clickedAt = LocalDateTime.now();
    }
}
