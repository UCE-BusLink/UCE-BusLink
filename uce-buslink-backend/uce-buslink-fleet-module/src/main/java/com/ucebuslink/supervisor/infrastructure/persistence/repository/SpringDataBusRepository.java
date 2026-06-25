package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.BusJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SpringDataBusRepository extends JpaRepository<BusJpaEntity, UUID> {
    Optional<BusJpaEntity> findByPlateNumberAndDeletedAtIsNull(String plateNumber);
    Optional<BusJpaEntity> findByIdAndDeletedAtIsNull(UUID id);

    Page<BusJpaEntity> findByDeletedAtIsNull(Pageable pageable);
    
    @Query("SELECT b FROM BusJpaEntity b WHERE b.deletedAt IS NULL")
    List<BusJpaEntity> findAllActiveBuses();
}