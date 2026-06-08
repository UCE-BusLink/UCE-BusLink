package com.ucebuslink.identity.application.service;

import com.ucebuslink.identity.domain.model.User;

public interface TokenProviderPort {

    String generateToken(User user);
}