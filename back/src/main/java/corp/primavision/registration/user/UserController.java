package corp.primavision.registration.user;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
public class UserController {
  private final UserRepository repo;

  public UserController(UserRepository repo) { this.repo = repo; }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req) {
    if (repo.existsByEmail(req.getEmail())) {
      return ResponseEntity.badRequest().body(new ApiMessage(false, "Email déjà utilisé"));
    }
    User u = new User();
    u.setFullName(req.getFullName());
    u.setEmail(req.getEmail());
    u.setPassword(req.getPassword()); // ⚠️ démo; en prod, hasher (BCrypt).
    repo.save(u);
    return ResponseEntity.ok(new ApiMessage(true, "User registered"));
  }

  record ApiMessage(boolean ok, String message) {}
}
