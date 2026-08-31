package com.mountain.for_mountain.domain.lineworks.model;

public record LineWorksUser(
        String userId,
        String externalKey,
        String loginId,
        String email,
        String name,
        String phoneticName,
        String position,
        String orgUnitId,
        String status
) {
}
