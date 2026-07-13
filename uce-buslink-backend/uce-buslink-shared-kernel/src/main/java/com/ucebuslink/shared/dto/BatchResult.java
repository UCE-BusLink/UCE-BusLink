package com.ucebuslink.shared.dto;

import java.util.List;

/**
 * Outcome of a batch operation where valid items are persisted individually
 * and invalid ones are reported without discarding the whole request.
 */
public record BatchResult<T>(
    List<T> succeeded,
    List<BatchItemError> failed,
    int totalReceived,
    int successCount,
    int failureCount
) {
    public static <T> BatchResult<T> of(List<T> succeeded, List<BatchItemError> failed, int totalReceived) {
        return new BatchResult<>(succeeded, failed, totalReceived, succeeded.size(), failed.size());
    }
}
