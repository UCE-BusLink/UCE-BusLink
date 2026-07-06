package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.dto.profile.UpdateUserProfileRequest;
import com.ucebuslink.identity.application.dto.profile.UserProfileResponse;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class UpdateUserProfileUseCase {

    private final UserRepository userRepository;
    private final GetUserProfileUseCase getUserProfileUseCase;

    public UpdateUserProfileUseCase(UserRepository userRepository, GetUserProfileUseCase getUserProfileUseCase) {
        this.userRepository = userRepository;
        this.getUserProfileUseCase = getUserProfileUseCase;
    }

    @Transactional
    public Optional<UserProfileResponse> execute(UUID userId, UpdateUserProfileRequest request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();

        if (request.getTelefonoContacto() != null) {
            user.setPhone(request.getTelefonoContacto());
        }
        if (request.getDireccion() != null) {
            user.setAddress(request.getDireccion());
        }
        if (request.getCarrera() != null) {
            user.setCareer(request.getCarrera());
        }
        if (request.getNumeroDocumento() != null) {
            user.setDocumentNumber(request.getNumeroDocumento());
        }
        if (request.getFechaNacimiento() != null) {
            user.setBirthDate(request.getFechaNacimiento());
        }

        userRepository.save(user);

        return getUserProfileUseCase.execute(userId);
    }
}
