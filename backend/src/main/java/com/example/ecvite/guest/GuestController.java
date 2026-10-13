package com.example.ecvite.guest;

import com.example.ecvite.account.AppUser;
import com.example.ecvite.account.CurrentUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
public class GuestController {
    private final GuestRepository repository;
    private final CurrentUserService currentUser;
    public GuestController(GuestRepository repository, CurrentUserService currentUser) {
        this.repository = repository;
        this.currentUser = currentUser;
    }

    @GetMapping public List<Guest> all(HttpSession session) {
        return repository.findAllByOwnerId(currentUser.require(session).getId());
    }
    @PostMapping public Guest create(@RequestBody Guest guest, HttpSession session) {
        AppUser owner = currentUser.require(session);
        guest.setId(null); guest.setOwner(owner); validate(guest); return repository.save(guest);
    }
    @PutMapping("/{id}") public Guest update(@PathVariable Long id, @RequestBody Guest input, HttpSession session) {
        AppUser owner = currentUser.require(session);
        Guest guest = repository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found"));
        guest.setName(input.getName()); guest.setPhone(input.getPhone()); guest.setGroupName(input.getGroupName());
        guest.setSeats(input.getSeats()); guest.setStatus(input.getStatus()); guest.setNotes(input.getNotes());
        validate(guest); return repository.save(guest);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpSession session) {
        AppUser owner = currentUser.require(session);
        Guest guest = repository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found"));
        repository.delete(guest);
    }
    private void validate(Guest guest) {
        if (guest.getName() == null || guest.getName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        if (guest.getSeats() == null || guest.getSeats() < 1) guest.setSeats(1);
        if (!List.of("CONFIRMED", "PENDING", "DECLINED").contains(guest.getStatus())) guest.setStatus("PENDING");
    }
}
