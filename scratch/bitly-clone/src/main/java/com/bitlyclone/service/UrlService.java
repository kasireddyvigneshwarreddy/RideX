package com.bitlyclone.service;

import com.bitlyclone.dto.UrlDetails;
import com.bitlyclone.dto.UrlRequest;
import com.bitlyclone.dto.UrlResponse;
import com.bitlyclone.entity.Url;
import com.bitlyclone.entity.User;
import com.bitlyclone.exception.CustomAliasAlreadyExistsException;
import com.bitlyclone.exception.UrlExpiredException;
import com.bitlyclone.exception.UrlNotFoundException;
import com.bitlyclone.repository.UrlRepository;
import com.bitlyclone.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private static final String BASE_URL = "http://localhost:8080/";

    @Transactional
    public UrlResponse shortenUrl(UrlRequest request, User user) {
        Url url = Url.builder()
                .longUrl(request.getLongUrl())
                .title(request.getTitle() != null ? request.getTitle() : "Untitled Link")
                .expiryDate(request.getExpiryDate())
                .user(user)
                .shortCode(UUID.randomUUID().toString().substring(0, 8)) // Temp unique placeholder
                .build();

        url = urlRepository.save(url);

        String shortCode = Base62Encoder.encode(url.getId());
        url.setShortCode(shortCode);
        url = urlRepository.save(url);

        return mapToUrlResponse(url);
    }

    @Transactional
    public UrlResponse createCustomUrl(UrlRequest request, User user) {
        String customAlias = request.getCustomAlias();
        if (customAlias == null || customAlias.isBlank()) {
            throw new IllegalArgumentException("Custom alias cannot be empty");
        }

        if (urlRepository.existsByCustomAlias(customAlias) || urlRepository.existsByShortCode(customAlias)) {
            throw new CustomAliasAlreadyExistsException("Custom alias '" + customAlias + "' is already in use");
        }

        Url url = Url.builder()
                .longUrl(request.getLongUrl())
                .customAlias(customAlias)
                .shortCode(customAlias) // Using customAlias as the shortCode for easy routing
                .title(request.getTitle() != null ? request.getTitle() : "Custom Link")
                .expiryDate(request.getExpiryDate())
                .user(user)
                .build();

        url = urlRepository.save(url);
        return mapToUrlResponse(url);
    }

    @Transactional(readOnly = true)
    public List<UrlDetails> getMyLinks(User user) {
        return urlRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToUrlDetails)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUrl(Long id, User user) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new UrlNotFoundException("URL not found with id: " + id));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to delete this URL");
        }

        urlRepository.delete(url);
    }

    @Transactional
    public UrlDetails updateUrl(Long id, UrlRequest request, User user) {
        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new UrlNotFoundException("URL not found with id: " + id));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to update this URL");
        }

        url.setLongUrl(request.getLongUrl());
        if (request.getTitle() != null) {
            url.setTitle(request.getTitle());
        }
        if (request.getExpiryDate() != null) {
            url.setExpiryDate(request.getExpiryDate());
        }
        
        url = urlRepository.save(url);
        return mapToUrlDetails(url);
    }

    @Transactional
    public Url getUrlForRedirect(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException("Short URL not found for code: " + shortCode));

        if (!url.isActive()) {
            throw new UrlExpiredException("This short URL has been disabled");
        }

        if (url.getExpiryDate() != null && url.getExpiryDate().isBefore(LocalDateTime.now())) {
            url.setActive(false);
            urlRepository.save(url);
            throw new UrlExpiredException("This short URL has expired");
        }

        // Increment click count
        url.setClickCount(url.getClickCount() + 1);
        return urlRepository.save(url);
    }

    private UrlResponse mapToUrlResponse(Url url) {
        return UrlResponse.builder()
                .id(url.getId())
                .shortCode(url.getShortCode())
                .shortUrl(BASE_URL + url.getShortCode())
                .clickCount(url.getClickCount())
                .build();
    }

    private UrlDetails mapToUrlDetails(Url url) {
        return UrlDetails.builder()
                .id(url.getId())
                .longUrl(url.getLongUrl())
                .shortCode(url.getShortCode())
                .shortUrl(BASE_URL + url.getShortCode())
                .customAlias(url.getCustomAlias())
                .title(url.getTitle())
                .createdAt(url.getCreatedAt())
                .updatedAt(url.getUpdatedAt())
                .expiryDate(url.getExpiryDate())
                .isActive(url.isActive())
                .clickCount(url.getClickCount())
                .build();
    }
}
