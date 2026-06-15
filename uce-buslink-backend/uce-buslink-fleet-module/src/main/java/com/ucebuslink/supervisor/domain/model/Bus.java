package com.ucebuslink.supervisor.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Bus {
    private UUID id;
    private String plateNumber;
    private String internalCode;
    private Integer seatCapacity;
    private String manufacturer;
    private String model;
    private BusStatus operationalStatus;
    private UUID createdBy;
    private UUID updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    public Bus() {}

    public Bus(UUID id, String plateNumber, String internalCode, Integer seatCapacity, 
               String manufacturer, String model, BusStatus operationalStatus, 
               UUID createdBy, UUID updatedBy, LocalDateTime createdAt, 
               LocalDateTime updatedAt, LocalDateTime deletedAt) {
        this.id = id;
        this.plateNumber = plateNumber;
        this.internalCode = internalCode;
        this.seatCapacity = seatCapacity;
        this.manufacturer = manufacturer;
        this.model = model;
        this.operationalStatus = operationalStatus;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }

    public String getInternalCode() { return internalCode; }
    public void setInternalCode(String internalCode) { this.internalCode = internalCode; }

    public Integer getSeatCapacity() { return seatCapacity; }
    public void setSeatCapacity(Integer seatCapacity) { this.seatCapacity = seatCapacity; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public BusStatus getOperationalStatus() { return operationalStatus; }
    public void setOperationalStatus(BusStatus operationalStatus) { this.operationalStatus = operationalStatus; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}