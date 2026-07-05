package com.ucebuslink.identity.adapters.input.http;

import com.ucebuslink.identity.application.dto.BasicUserResponse;
import com.ucebuslink.identity.application.usecase.GetBasicUserInfoUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class PublicUserController {

    private final GetBasicUserInfoUseCase getBasicUserInfoUseCase;

    public PublicUserController(GetBasicUserInfoUseCase getBasicUserInfoUseCase) {
        this.getBasicUserInfoUseCase = getBasicUserInfoUseCase;
    }

    @GetMapping("/{id}/basic")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BasicUserResponse> getBasicUserInfo(@PathVariable("id") UUID id) {
        return getBasicUserInfoUseCase.execute(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
