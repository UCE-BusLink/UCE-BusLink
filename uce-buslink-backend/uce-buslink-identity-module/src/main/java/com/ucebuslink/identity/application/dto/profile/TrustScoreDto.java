package com.ucebuslink.identity.application.dto.profile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class TrustScoreDto {
    private UUID id;
    private UUID usuarioId;
    private int puntuacion;
    private String nivel;
    private int reservasTotales;
    private int reservasCompletadas;
    private int noShows;
    private int cancelacionesUltimo30dias;
    private List<TrustPenaltyDto> penalizacionesActivas;
    private int trendultimos7dias;
    private LocalDateTime proximaRevision;
    private List<TrustScoreHistoryDto> historico;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUsuarioId() { return usuarioId; }
    public void setUsuarioId(UUID usuarioId) { this.usuarioId = usuarioId; }
    public int getPuntuacion() { return puntuacion; }
    public void setPuntuacion(int puntuacion) { this.puntuacion = puntuacion; }
    public String getNivel() { return nivel; }
    public void setNivel(String nivel) { this.nivel = nivel; }
    public int getReservasTotales() { return reservasTotales; }
    public void setReservasTotales(int reservasTotales) { this.reservasTotales = reservasTotales; }
    public int getReservasCompletadas() { return reservasCompletadas; }
    public void setReservasCompletadas(int reservasCompletadas) { this.reservasCompletadas = reservasCompletadas; }
    public int getNoShows() { return noShows; }
    public void setNoShows(int noShows) { this.noShows = noShows; }
    public int getCancelacionesUltimo30dias() { return cancelacionesUltimo30dias; }
    public void setCancelacionesUltimo30dias(int cancelacionesUltimo30dias) { this.cancelacionesUltimo30dias = cancelacionesUltimo30dias; }
    public List<TrustPenaltyDto> getPenalizacionesActivas() { return penalizacionesActivas; }
    public void setPenalizacionesActivas(List<TrustPenaltyDto> penalizacionesActivas) { this.penalizacionesActivas = penalizacionesActivas; }
    public int getTrendultimos7dias() { return trendultimos7dias; }
    public void setTrendultimos7dias(int trendultimos7dias) { this.trendultimos7dias = trendultimos7dias; }
    public LocalDateTime getProximaRevision() { return proximaRevision; }
    public void setProximaRevision(LocalDateTime proximaRevision) { this.proximaRevision = proximaRevision; }
    public List<TrustScoreHistoryDto> getHistorico() { return historico; }
    public void setHistorico(List<TrustScoreHistoryDto> historico) { this.historico = historico; }
}
