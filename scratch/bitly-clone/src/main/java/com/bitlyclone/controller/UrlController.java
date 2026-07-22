package com.bitlyclone.controller;

import com.bitlyclone.dto.UrlDetails;
import com.bitlyclone.dto.UrlRequest;
import com.bitlyclone.dto.UrlResponse;
import com.bitlyclone.entity.User;
import com.bitlyclone.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/url")
@RequiredArgsConstructor
public class UrlController {

    private final UrlService urlService;

    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> shortenUrl(
            @Valid @RequestBody UrlRequest request,
            @AuthenticationPrincipal User user
    ) {
        UrlResponse response = urlService.shortenUrl(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/custom")
    public ResponseEntity<UrlResponse> createCustomUrl(
            @Valid @RequestBody UrlRequest request,
            @AuthenticationPrincipal User user
    ) {
        UrlResponse response = urlService.createCustomUrl(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-links")
    public ResponseEntity<List<UrlDetails>> getMyLinks(@AuthenticationPrincipal User user) {
        List<UrlDetails> links = urlService.getMyLinks(user);
        return ResponseEntity.ok(links);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UrlDetails> updateUrl(
            @PathVariable Long id,
            @Valid @RequestBody UrlRequest request,
            @AuthenticationPrincipal User user
    ) {
        UrlDetails updated = urlService.updateUrl(id, request, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        urlService.deleteUrl(id, user);
        return ResponseEntity.ok(Map.of("message", "URL deleted successfully"));
    }
}
