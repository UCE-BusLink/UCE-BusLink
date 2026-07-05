package com.ucebuslink.identity.application.dto.profile;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserProfileDto {
    private UUID id;
    private String email;
    private String nombres;
    private String apellidos;
    private String rol;
    private String estado;
    private String fotoPerfil;
    private String telefonoContacto;
    private String direccion;
    private String fechaNacimiento;
    private String generoCorreo;
    private String carrera;
    private String numeroDocumento;
    private LocalDateTime fechaPrimerLogin;
    private LocalDateTime fechaUltimoLogin;
    private LocalDateTime fechaCreacionCuenta;

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(String fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getGeneroCorreo() { return generoCorreo; }
    public void setGeneroCorreo(String generoCorreo) { this.generoCorreo = generoCorreo; }
    public String getCarrera() { return carrera; }
    public void setCarrera(String carrera) { this.carrera = carrera; }
    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }
    public LocalDateTime getFechaPrimerLogin() { return fechaPrimerLogin; }
    public void setFechaPrimerLogin(LocalDateTime fechaPrimerLogin) { this.fechaPrimerLogin = fechaPrimerLogin; }
    public LocalDateTime getFechaUltimoLogin() { return fechaUltimoLogin; }
    public void setFechaUltimoLogin(LocalDateTime fechaUltimoLogin) { this.fechaUltimoLogin = fechaUltimoLogin; }
    public LocalDateTime getFechaCreacionCuenta() { return fechaCreacionCuenta; }
    public void setFechaCreacionCuenta(LocalDateTime fechaCreacionCuenta) { this.fechaCreacionCuenta = fechaCreacionCuenta; }
}
