package com.bitlyclone.service;

import com.bitlyclone.dto.ChangePasswordRequest;
import com.bitlyclone.entity.Url;
import com.bitlyclone.entity.User;
import com.bitlyclone.repository.ClickRepository;
import com.bitlyclone.repository.UrlRepository;
import com.bitlyclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickRepository clickRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(User user) {
        List<Url> urls = urlRepository.findByUserOrderByCreatedAtDesc(user);
        for (Url url : urls) {
            clickRepository.deleteAll(clickRepository.findByUrl(url));
            urlRepository.delete(url);
        }
        userRepository.delete(user);
    }
}
