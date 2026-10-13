package com.example.ecvite.guest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class GuestController {
    private final GuestRepository repository;
    public GuestController(GuestRepository repository) { this.repository = repository; }

    @GetMapping public List<Guest> all() { return repository.findAll(); }
    @PostMapping public Guest create(@RequestBody Guest guest) {
        guest.setId(null); validate(guest); return repository.save(guest);
    }
    @PutMapping("/{id}") public Guest update(@PathVariable Long id, @RequestBody Guest input) {
        Guest guest = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found"));
        guest.setName(input.getName()); guest.setPhone(input.getPhone()); guest.setGroupName(input.getGroupName());
        guest.setSeats(input.getSeats()); guest.setStatus(input.getStatus()); guest.setNotes(input.getNotes());
        validate(guest); return repository.save(guest);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Guest not found");
        repository.deleteById(id);
    }
    private void validate(Guest guest) {
        if (guest.getName() == null || guest.getName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        if (guest.getSeats() == null || guest.getSeats() < 1) guest.setSeats(1);
        if (!List.of("CONFIRMED", "PENDING", "DECLINED").contains(guest.getStatus())) guest.setStatus("PENDING");
    }
}
