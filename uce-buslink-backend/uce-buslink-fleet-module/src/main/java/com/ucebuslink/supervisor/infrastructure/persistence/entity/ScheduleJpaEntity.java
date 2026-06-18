package com.ucebuslink.supervisor.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "schedules")
@Getter
@Setter
public class ScheduleJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private RouteJpaEntity route;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(
            mappedBy = "schedule",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ScheduleDetailJpaEntity> details = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Mantiene sincronizada la relación bidireccional.
     */
    public void addDetail(ScheduleDetailJpaEntity detail) {
        details.add(detail);
        detail.setSchedule(this);
    }

    /**
     * Elimina un detalle y rompe la relación.
     */
    public void removeDetail(ScheduleDetailJpaEntity detail) {
        details.remove(detail);
        detail.setSchedule(null);
    }

    /**
     * Reemplaza completamente la colección de detalles.
     */
    public void setDetails(List<ScheduleDetailJpaEntity> details) {
        this.details.clear();

        if (details != null) {
            details.forEach(this::addDetail);
        }
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}