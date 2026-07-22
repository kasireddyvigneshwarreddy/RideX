package com.bitlyclone.repository;

import com.bitlyclone.entity.Click;
import com.bitlyclone.entity.Url;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClickRepository extends JpaRepository<Click, Long> {

    List<Click> findByUrl(Url url);

    long countByUrl(Url url);

    Optional<Click> findFirstByUrlOrderByClickedAtDesc(Url url);

    @Query("SELECT c.browser, COUNT(c) FROM Click c WHERE c.url = :url GROUP BY c.browser")
    List<Object[]> findBrowserStats(@Param("url") Url url);

    @Query("SELECT c.device, COUNT(c) FROM Click c WHERE c.url = :url GROUP BY c.device")
    List<Object[]> findDeviceStats(@Param("url") Url url);

    @Query("SELECT c.country, COUNT(c) FROM Click c WHERE c.url = :url GROUP BY c.country")
    List<Object[]> findCountryStats(@Param("url") Url url);
}
