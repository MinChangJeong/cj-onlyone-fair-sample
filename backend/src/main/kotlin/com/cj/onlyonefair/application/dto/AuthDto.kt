package com.cj.onlyonefair.application.dto

import com.cj.onlyonefair.domain.model.ParticipantRole
import jakarta.validation.constraints.NotBlank

data class QrAuthRequest(
    @field:NotBlank val qrToken: String
)

data class AuthResponse(
    val sessionToken: String,
    val role: ParticipantRole,
    val onboardingDone: Boolean,
    val displayName: String?
)

data class ParticipantResponse(
    val id: Long,
    val displayName: String?,
    val role: ParticipantRole,
    val onboardingDone: Boolean
)
