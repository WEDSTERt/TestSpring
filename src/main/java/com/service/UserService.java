package com.service;

import com.entity.User;
import com.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User createUser(String fullName, String email, String password) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User(fullName, email, passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, String fullName, String email, String password) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (fullName != null) user.setFullName(fullName);
        if (email != null) user.setEmail(email);
        if (password != null) user.setUserPassword(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll(Integer limit, Integer offset) {
        if (limit == null) limit = 100;
        if (offset == null) offset = 0;
        Pageable pageable = PageRequest.of(offset / limit, limit);
        return userRepository.findAll(pageable).getContent();
    }

    // Метод для входа (проверка email/пароль)
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(password, user.getUserPassword());
        //boolean passwordMatches = password.equals(user.getUserPassword()); // простое сравнение

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }
}