package com.ucebuslink.identity.application.dto.profile;

public class UserPreferencesDto {
    private boolean notificacionesHabilitadas;
    private boolean notificacionesEmail;
    private boolean compartirUbicacion;
    private String visibilidadPerfil;

    public boolean isNotificacionesHabilitadas() { return notificacionesHabilitadas; }
    public void setNotificacionesHabilitadas(boolean notificacionesHabilitadas) { this.notificacionesHabilitadas = notificacionesHabilitadas; }
    public boolean isNotificacionesEmail() { return notificacionesEmail; }
    public void setNotificacionesEmail(boolean notificacionesEmail) { this.notificacionesEmail = notificacionesEmail; }
    public boolean isCompartirUbicacion() { return compartirUbicacion; }
    public void setCompartirUbicacion(boolean compartirUbicacion) { this.compartirUbicacion = compartirUbicacion; }
    public String getVisibilidadPerfil() { return visibilidadPerfil; }
    public void setVisibilidadPerfil(String visibilidadPerfil) { this.visibilidadPerfil = visibilidadPerfil; }
}
