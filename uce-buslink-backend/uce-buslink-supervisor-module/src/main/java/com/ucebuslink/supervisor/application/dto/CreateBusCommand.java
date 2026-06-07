package com.ucebuslink.supervisor.application.dto;

public record CreateBusCommand(
    String plateNumber,
    String internalCode,
    Integer seatCapacity,
    String manufacturer,
    String model
) {}