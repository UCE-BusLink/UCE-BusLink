package com.ucebuslink.identity.application.usecase;

import com.ucebuslink.identity.application.dto.BasicUserResponse;
import com.ucebuslink.identity.domain.model.User;
import com.ucebuslink.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class GetBasicUserInfoUseCase {

    private final UserRepository userRepository;

    public GetBasicUserInfoUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<BasicUserResponse> execute(UUID id) {
        return userRepository.findById(id)
                .map(user -> new BasicUserResponse(user.getId(), user.getFirstName(), user.getLastName()));
    }
}
