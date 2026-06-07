package com.ucebuslink.supervisor.application.dto;

public record CreateStopCommand(
    String name,
    Double latitude,
    Double longitude
) {}