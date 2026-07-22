package com.bitlyclone.service;

import com.bitlyclone.dto.AnalyticsResponse;
import com.bitlyclone.entity.Click;
import com.bitlyclone.entity.Url;
import com.bitlyclone.entity.User;
import com.bitlyclone.exception.UrlNotFoundException;
import com.bitlyclone.repository.ClickRepository;
import com.bitlyclone.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickRepository clickRepository;
    private final UrlRepository urlRepository;

    @Transactional
    public void recordClick(Url url, String userAgent, String ipAddress, String referer) {
        String browser = parseBrowser(userAgent);
        String os = parseOS(userAgent);
        String device = parseDevice(userAgent);
        
        // Simple country fallback. In real production, this would use a GeoIP database.
        String country = "Localhost".equals(ipAddress) || "127.0.0.1".equals(ipAddress) || "0:0:0:0:0:0:0:1".equals(ipAddress)
                ? "Local Loopback" 
                : "Unknown Country";
        String city = "Local Loopback".equals(country) ? "Localhost" : "Unknown City";

        Click click = Click.builder()
                .url(url)
                .browser(browser)
                .operatingSystem(os)
                .device(device)
                .ipAddress(ipAddress)
                .country(country)
                .city(city)
                .referer(referer != null && !referer.isBlank() ? referer : "Direct")
                .build();

        clickRepository.save(click);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(String shortCode, User user) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException("Short URL not found for code: " + shortCode));

        // Check ownership
        if (!url.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view analytics for this URL");
        }

        long clickCount = url.getClickCount();
        
        Map<String, Long> browserStats = mapStats(clickRepository.findBrowserStats(url));
        Map<String, Long> deviceStats = mapStats(clickRepository.findDeviceStats(url));
        Map<String, Long> countryStats = mapStats(clickRepository.findCountryStats(url));

        Optional<Click> lastClick = clickRepository.findFirstByUrlOrderByClickedAtDesc(url);
        LocalDateTime lastClickedTime = lastClick.map(Click::getClickedAt).orElse(null);

        return AnalyticsResponse.builder()
                .clickCount(clickCount)
                .browserStats(browserStats)
                .deviceStats(deviceStats)
                .countryStats(countryStats)
                .creationDate(url.getCreatedAt())
                .expiryDate(url.getExpiryDate())
                .lastClicked(lastClickedTime)
                .build();
    }

    private Map<String, Long> mapStats(List<Object[]> queryResults) {
        Map<String, Long> statsMap = new HashMap<>();
        for (Object[] row : queryResults) {
            String key = row[0] != null ? row[0].toString() : "Unknown";
            Long count = row[1] != null ? (Long) row[1] : 0L;
            statsMap.put(key, count);
        }
        return statsMap;
    }

    private String parseBrowser(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        if (ua.contains("Postman")) return "Postman";
        if (ua.contains("Edge") || ua.contains("Edg")) return "Edge";
        if (ua.contains("OPR") || ua.contains("Opera")) return "Opera";
        if (ua.contains("Chrome")) return "Chrome";
        if (ua.contains("Firefox")) return "Firefox";
        if (ua.contains("Safari")) return "Safari";
        return "Other";
    }

    private String parseOS(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        if (ua.contains("Windows")) return "Windows";
        if (ua.contains("Macintosh") || ua.contains("Mac OS")) return "macOS";
        if (ua.contains("Linux")) return "Linux";
        if (ua.contains("Android")) return "Android";
        if (ua.contains("iPhone") || ua.contains("iPad")) return "iOS";
        return "Other";
    }

    private String parseDevice(String ua) {
        if (ua == null || ua.isBlank()) return "Unknown";
        if (ua.contains("Mobi") || ua.contains("Android") || ua.contains("iPhone") || ua.contains("iPad")) {
            return "Mobile";
        }
        return "Desktop";
    }
}
