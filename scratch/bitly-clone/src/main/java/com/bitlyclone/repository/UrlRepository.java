package com.bitlyclone.repository;

import com.bitlyclone.entity.Url;
import com.bitlyclone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    Optional<Url> findByShortCode(String shortCode);
    Optional<Url> findByCustomAlias(String customAlias);
    Optional<Url> findByShortCodeOrCustomAlias(String shortCode, String customAlias);
    
    boolean existsByShortCode(String shortCode);
    boolean existsByCustomAlias(String customAlias);
    
    List<Url> findByUserOrderByCreatedAtDesc(User user);
}
