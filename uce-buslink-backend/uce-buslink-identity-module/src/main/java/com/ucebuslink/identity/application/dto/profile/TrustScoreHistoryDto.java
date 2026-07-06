package com.ucebuslink.identity.application.dto.profile;

import java.time.LocalDateTime;

public class TrustScoreHistoryDto {
    private LocalDateTime fecha;
    private String evento;
    private int cambio;
    private int puntuacionResultante;

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public String getEvento() { return evento; }
    public void setEvento(String evento) { this.evento = evento; }
    public int getCambio() { return cambio; }
    public void setCambio(int cambio) { this.cambio = cambio; }
    public int getPuntuacionResultante() { return puntuacionResultante; }
    public void setPuntuacionResultante(int puntuacionResultante) { this.puntuacionResultante = puntuacionResultante; }
}
