package com.mountain.for_mountain.domain.lineworks.model;

public record LineWorksOrgUnit(
        String orgUnitId,
        String externalKey,
        String name,
        String parentOrgUnitId,
        String managerUserId
) {
}
