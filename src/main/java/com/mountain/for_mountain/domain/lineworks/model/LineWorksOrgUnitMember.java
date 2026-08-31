package com.mountain.for_mountain.domain.lineworks.model;

public record LineWorksOrgUnitMember(
        String id,
        String type,
        String externalKey,
        boolean manager
) {
}
