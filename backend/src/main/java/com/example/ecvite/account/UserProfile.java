package com.example.ecvite.account;

public record UserProfile(Long id, String name, String email, String phone) {
    static UserProfile from(AppUser user) {
        return new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getPhone());
    }
}
