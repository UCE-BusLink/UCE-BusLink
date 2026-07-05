package com.ucebuslink.identity.application.dto.profile;

import java.util.List;
import java.util.UUID;

public class UserStatsDto {
    private int viajesTotales;
    private int viajesTotalesCompletados;
    private double kmTotalesViajados;
    private double horasTotalesEnTransito;
    private int diasActivo;
    private double tiempoPromedioEspera;
    private List<RutaFrecuenteDto> rutasFrecuentes;

    public static class RutaFrecuenteDto {
        private UUID rutaId;
        private String nombreRuta;
        private int vecesUtilizada;

        public UUID getRutaId() { return rutaId; }
        public void setRutaId(UUID rutaId) { this.rutaId = rutaId; }
        public String getNombreRuta() { return nombreRuta; }
        public void setNombreRuta(String nombreRuta) { this.nombreRuta = nombreRuta; }
        public int getVecesUtilizada() { return vecesUtilizada; }
        public void setVecesUtilizada(int vecesUtilizada) { this.vecesUtilizada = vecesUtilizada; }
    }

    public int getViajesTotales() { return viajesTotales; }
    public void setViajesTotales(int viajesTotales) { this.viajesTotales = viajesTotales; }
    public int getViajesTotalesCompletados() { return viajesTotalesCompletados; }
    public void setViajesTotalesCompletados(int viajesTotalesCompletados) { this.viajesTotalesCompletados = viajesTotalesCompletados; }
    public double getKmTotalesViajados() { return kmTotalesViajados; }
    public void setKmTotalesViajados(double kmTotalesViajados) { this.kmTotalesViajados = kmTotalesViajados; }
    public double getHorasTotalesEnTransito() { return horasTotalesEnTransito; }
    public void setHorasTotalesEnTransito(double horasTotalesEnTransito) { this.horasTotalesEnTransito = horasTotalesEnTransito; }
    public int getDiasActivo() { return diasActivo; }
    public void setDiasActivo(int diasActivo) { this.diasActivo = diasActivo; }
    public double getTiempoPromedioEspera() { return tiempoPromedioEspera; }
    public void setTiempoPromedioEspera(double tiempoPromedioEspera) { this.tiempoPromedioEspera = tiempoPromedioEspera; }
    public List<RutaFrecuenteDto> getRutasFrecuentes() { return rutasFrecuentes; }
    public void setRutasFrecuentes(List<RutaFrecuenteDto> rutasFrecuentes) { this.rutasFrecuentes = rutasFrecuentes; }
}
