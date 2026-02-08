package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.AuthResponse
import com.cj.onlyonefair.application.dto.ParticipantResponse
import com.cj.onlyonefair.application.dto.QrAuthRequest
import com.cj.onlyonefair.application.service.AuthService
import com.cj.onlyonefair.domain.model.Participant
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/qr")
    fun authenticateWithQr(
        @Valid @RequestBody request: QrAuthRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        val response = authService.createSessionFromQr(request.qrToken)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    @PostMapping("/onboarding-complete")
    fun completeOnboarding(
        authentication: Authentication
    ): ResponseEntity<ApiResponse<Unit>> {
        val participant = getCurrentParticipant(authentication)
        authService.completeOnboarding(participant.id)
        return ResponseEntity.ok(ApiResponse.ok(Unit))
    }

    @GetMapping("/me")
    fun getCurrentUser(
        authentication: Authentication
    ): ResponseEntity<ApiResponse<ParticipantResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = ParticipantResponse(
            id = participant.id,
            displayName = participant.displayName,
            role = participant.role,
            onboardingDone = participant.onboardingDone
        )
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    private fun getCurrentParticipant(authentication: Authentication): Participant {
        return authentication.principal as Participant
    }
}
