package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.AuthResponse
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.model.ParticipantRole
import com.cj.onlyonefair.domain.repository.ParticipantRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val participantRepository: ParticipantRepository
) {

    fun createSessionFromQr(qrToken: String): AuthResponse {
        if (qrToken.isBlank()) {
            throw IllegalArgumentException("QR token cannot be empty")
        }

        val sessionToken = UUID.randomUUID().toString()
        val participant = Participant(
            sessionToken = sessionToken,
            role = ParticipantRole.PARTICIPANT
        )
        val saved = participantRepository.save(participant)

        return AuthResponse(
            sessionToken = saved.sessionToken,
            role = saved.role,
            onboardingDone = saved.onboardingDone,
            displayName = saved.displayName
        )
    }

    @Transactional(readOnly = true)
    fun getParticipant(sessionToken: String): Participant? {
        return participantRepository.findBySessionToken(sessionToken)
    }

    fun completeOnboarding(participantId: Long) {
        val participant = participantRepository.findById(participantId)
            .orElseThrow { NoSuchElementException("Participant not found with id: $participantId") }

        participant.onboardingDone = true
        participant.lastActiveAt = Instant.now()
        participantRepository.save(participant)
    }
}
