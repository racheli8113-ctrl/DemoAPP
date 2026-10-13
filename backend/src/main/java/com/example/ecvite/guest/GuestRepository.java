package com.example.ecvite.guest;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Long> {
    List<Guest> findAllByOwnerId(Long ownerId);
    Optional<Guest> findByIdAndOwnerId(Long id, Long ownerId);
}
