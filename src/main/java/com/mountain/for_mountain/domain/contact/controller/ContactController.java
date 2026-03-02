package com.mountain.for_mountain.domain.contact.controller;

import com.mountain.for_mountain.domain.contact.dto.ContactRequest;
import com.mountain.for_mountain.domain.contact.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/contact")
@Tag(name = "Contact API", description = "Contact Form Email API")
public class ContactController {

    private final ContactService contactService;

    @Operation(
        summary = "Send contact email",
        description = "Receives contact form data and sends an email notification via SMTP."
    )
    @PostMapping
    public ResponseEntity<Map<String, Boolean>> sendContact(
            @Valid @RequestBody ContactRequest request) {
        contactService.sendContactMail(request);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
