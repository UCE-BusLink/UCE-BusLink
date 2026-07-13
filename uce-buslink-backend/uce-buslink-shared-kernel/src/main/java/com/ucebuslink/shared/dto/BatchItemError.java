package com.ucebuslink.shared.dto;

import java.util.Map;

/**
 * Describes why a single item inside a batch request failed,
 * identified by its zero-based position in the original request list.
 */
public record BatchItemError(
    int index,
    String reason,
    Map<String, String> fieldErrors
) {}
