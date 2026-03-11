package com.mountain.for_mountain.domain.group.controller;

import com.mountain.for_mountain.domain.group.dto.GroupRequest;
import com.mountain.for_mountain.domain.group.dto.GroupResponse;
import com.mountain.for_mountain.domain.group.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/groups")
@Tag(name = "Group API", description = "Group management API")
public class GroupController {

    private final GroupService groupService;

    @Operation(summary = "Get groups")
    @GetMapping
    public ResponseEntity<List<GroupResponse>> getList() {
        return ResponseEntity.ok(groupService.getList());
    }

    @Operation(summary = "Create group", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    public ResponseEntity<GroupResponse> create(@Valid @RequestBody GroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.create(request));
    }

    @Operation(summary = "Update group", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<GroupResponse> update(@PathVariable Long id, @Valid @RequestBody GroupRequest request) {
        return ResponseEntity.ok(groupService.update(id, request));
    }

    @Operation(summary = "Delete group", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
