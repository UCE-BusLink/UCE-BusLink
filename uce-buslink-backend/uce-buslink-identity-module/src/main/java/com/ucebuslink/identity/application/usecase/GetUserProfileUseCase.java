package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.dto.profile.*;
import com.ucebuslink.identity.domain.model.TrustPenalty;
import com.ucebuslink.identity.domain.model.TrustScore;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.model.UserStats;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import com.ucebuslink.identity.domain.repository.UserRepository;
import com.ucebuslink.identity.domain.repository.UserStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GetUserProfileUseCase {

    private final UserRepository userRepository;
    private final TrustScoreRepository trustScoreRepository;
    private final UserStatsRepository userStatsRepository;

    public GetUserProfileUseCase(UserRepository userRepository, 
                                 TrustScoreRepository trustScoreRepository,
                                 UserStatsRepository userStatsRepository) {
        this.userRepository = userRepository;
        this.trustScoreRepository = trustScoreRepository;
        this.userStatsRepository = userStatsRepository;
    }

    @Transactional
    public Optional<UserProfileResponse> execute(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        // Get or Create Trust Score
        TrustScore trustScore = trustScoreRepository.findByUserId(userId)
                .orElseGet(() -> trustScoreRepository.save(TrustScore.createDefault(userId)));

        // Get or Create User Stats
        UserStats userStats = userStatsRepository.findByUserId(userId)
                .orElseGet(() -> userStatsRepository.save(UserStats.createDefault(userId)));

        UserProfileResponse response = new UserProfileResponse();
        
        // 1. Map UserProfileDto
        UserProfileDto userDto = new UserProfileDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setNombres(user.getFirstName());
        userDto.setApellidos(user.getLastName());
        userDto.setRol(user.getRole() != null ? user.getRole().name() : null);
        userDto.setEstado(user.getStatus() != null ? user.getStatus().name() : null);
        userDto.setFotoPerfil(user.getProfilePictureUrl());
        userDto.setTelefonoContacto(user.getPhone());
        userDto.setDireccion(user.getAddress());
        userDto.setFechaNacimiento(user.getBirthDate() != null ? user.getBirthDate().toString() : null);
        
        // Assuming email structure is name.surname@domain, simple extraction
        if (user.getEmail() != null && user.getEmail().contains("@")) {
            userDto.setGeneroCorreo(user.getEmail().substring(0, user.getEmail().indexOf("@")));
        }
        
        userDto.setCarrera(user.getCareer());
        userDto.setNumeroDocumento(user.getDocumentNumber());
        userDto.setFechaPrimerLogin(user.getCreatedAt()); // Approximate mapping
        userDto.setFechaUltimoLogin(user.getLastLoginAt());
        userDto.setFechaCreacionCuenta(user.getCreatedAt());
        response.setUsuario(userDto);

        // 2. Map TrustScoreDto
        TrustScoreDto scoreDto = new TrustScoreDto();
        scoreDto.setId(trustScore.getId());
        scoreDto.setUsuarioId(trustScore.getUserId());
        scoreDto.setPuntuacion(trustScore.getScore());
        scoreDto.setNivel(trustScore.getLevel().name());
        scoreDto.setReservasTotales(trustScore.getTotalReservations());
        scoreDto.setReservasCompletadas(trustScore.getCompletedReservations());
        scoreDto.setNoShows(trustScore.getNoShows());
        scoreDto.setCancelacionesUltimo30dias(trustScore.getCancellationsLast30Days());
        scoreDto.setTrendultimos7dias(trustScore.getTrendLast7Days());
        scoreDto.setProximaRevision(trustScore.getNextReviewAt());
        
        List<TrustPenaltyDto> activePenaltiesDto = new ArrayList<>();
        if (trustScore.getActivePenalties() != null) {
            activePenaltiesDto = trustScore.getActivePenalties().stream().map(p -> {
                TrustPenaltyDto pDto = new TrustPenaltyDto();
                pDto.setId(p.getId());
                pDto.setTipo(p.getType().name());
                pDto.setRazon(p.getReason());
                pDto.setPuntosRestados(p.getPointsRemoved());
                pDto.setFechaInicio(p.getStartsAt());
                pDto.setFechaExpiracion(p.getExpiresAt());
                pDto.setEstado(p.getStatus().name());
                return pDto;
            }).collect(Collectors.toList());
        }
        scoreDto.setPenalizacionesActivas(activePenaltiesDto);
        scoreDto.setHistorico(new ArrayList<>()); // Placeholder for now
        
        response.setPuntuacionConfianza(scoreDto);

        // 3. Map UserStatsDto
        UserStatsDto statsDto = new UserStatsDto();
        statsDto.setViajesTotales(userStats.getTotalTrips());
        statsDto.setViajesTotalesCompletados(userStats.getCompletedTrips());
        statsDto.setKmTotalesViajados(userStats.getTotalDistanceKm());
        statsDto.setHorasTotalesEnTransito(userStats.getTotalHoursTransit());
        statsDto.setDiasActivo(userStats.getActiveDays());
        statsDto.setTiempoPromedioEspera(0.0);
        statsDto.setRutasFrecuentes(new ArrayList<>());
        response.setEstadisticas(statsDto);

        // 4. Map Mocked UserPreferencesDto
        UserPreferencesDto prefsDto = new UserPreferencesDto();
        prefsDto.setNotificacionesHabilitadas(true);
        prefsDto.setNotificacionesEmail(false);
        prefsDto.setCompartirUbicacion(true);
        prefsDto.setVisibilidadPerfil("PRIVATE");
        response.setPreferencias(prefsDto);

        return Optional.of(response);
    }
}
