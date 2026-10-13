package com.example.ecvite.account;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class AuthController {
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserProfile register(@Valid @RequestBody RegistrationRequest request, HttpSession session) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "כתובת האימייל כבר רשומה במערכת.");
        }

        AppUser user = users.save(new AppUser(
                request.name().trim(),
                email,
                request.phone().trim(),
                passwordEncoder.encode(request.password())
        ));
        session.setAttribute(CurrentUserService.SESSION_USER_ID, user.getId());
        return UserProfile.from(user);
    }

    @PostMapping("/login")
    public UserProfile login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        AppUser user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "כתובת האימייל או הסיסמה שגויות."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "כתובת האימייל או הסיסמה שגויות.");
        }
        session.setAttribute(CurrentUserService.SESSION_USER_ID, user.getId());
        return UserProfile.from(user);
    }

    @GetMapping("/me")
    public UserProfile currentUser(HttpSession session) {
        Object userId = session.getAttribute(CurrentUserService.SESSION_USER_ID);
        if (!(userId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "נדרשת התחברות.");
        }
        AppUser user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "נדרשת התחברות."));
        return UserProfile.from(user);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpSession session) {
        session.invalidate();
    }
}
