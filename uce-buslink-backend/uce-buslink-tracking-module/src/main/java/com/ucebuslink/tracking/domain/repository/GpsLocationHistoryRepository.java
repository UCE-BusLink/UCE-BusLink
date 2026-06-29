package com.ucebuslink.tracking.domain.repository;

import com.ucebuslink.tracking.domain.model.GpsLocationHistory;
import java.util.List;

public interface GpsLocationHistoryRepository {
    void saveAll(List<GpsLocationHistory> locations);
}