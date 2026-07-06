package com.ucebuslink.identity.application.dto.profile;

import java.util.List;

public class UserProfileResponse {
    
    private UserProfileDto usuario;
    private TrustScoreDto puntuacionConfianza;
    private UserStatsDto estadisticas;
    private UserPreferencesDto preferencias;

    public UserProfileResponse() {
    }

    public UserProfileResponse(UserProfileDto usuario, TrustScoreDto puntuacionConfianza, UserStatsDto estadisticas, UserPreferencesDto preferencias) {
        this.usuario = usuario;
        this.puntuacionConfianza = puntuacionConfianza;
        this.estadisticas = estadisticas;
        this.preferencias = preferencias;
    }

    public UserProfileDto getUsuario() { return usuario; }
    public void setUsuario(UserProfileDto usuario) { this.usuario = usuario; }
    
    public TrustScoreDto getPuntuacionConfianza() { return puntuacionConfianza; }
    public void setPuntuacionConfianza(TrustScoreDto puntuacionConfianza) { this.puntuacionConfianza = puntuacionConfianza; }
    
    public UserStatsDto getEstadisticas() { return estadisticas; }
    public void setEstadisticas(UserStatsDto estadisticas) { this.estadisticas = estadisticas; }
    
    public UserPreferencesDto getPreferencias() { return preferencias; }
    public void setPreferencias(UserPreferencesDto preferencias) { this.preferencias = preferencias; }
}
