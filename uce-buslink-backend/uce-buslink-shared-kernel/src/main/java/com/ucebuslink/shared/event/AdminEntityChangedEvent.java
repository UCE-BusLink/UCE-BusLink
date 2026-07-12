package com.ucebuslink.shared.event;

import java.util.UUID;

public record AdminEntityChangedEvent(
    String entityType,
    String action,
    UUID entityId
) {}
