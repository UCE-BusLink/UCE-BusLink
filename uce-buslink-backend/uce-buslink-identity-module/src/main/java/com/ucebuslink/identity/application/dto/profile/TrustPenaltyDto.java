package com.ucebuslink.identity.application.dto.profile;

import java.time.LocalDateTime;
import java.util.UUID;

public class TrustPenaltyDto {
    private UUID id;
    private String tipo;
    private String razon;
    private int puntosRestados;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaExpiracion;
    private String estado;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getRazon() { return razon; }
    public void setRazon(String razon) { this.razon = razon; }
    public int getPuntosRestados() { return puntosRestados; }
    public void setPuntosRestados(int puntosRestados) { this.puntosRestados = puntosRestados; }
    public LocalDateTime getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDateTime fechaInicio) { this.fechaInicio = fechaInicio; }
    public LocalDateTime getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(LocalDateTime fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
