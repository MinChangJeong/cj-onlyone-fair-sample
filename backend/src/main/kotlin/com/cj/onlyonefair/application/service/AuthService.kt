package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.AuthResponse
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.model.ParticipantRole
import com.cj.onlyonefair.domain.repository.BoothRepository
import com.cj.onlyonefair.domain.repository.ParticipantRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val participantRepository: ParticipantRepository,
    private val boothRepository: BoothRepository
) {

    fun createSessionFromQr(qrToken: String): AuthResponse {
        val booth = boothRepository.findByQrToken(qrToken)
            ?: throw IllegalArgumentException("Invalid QR token")

        val sessionToken = UUID.randomUUID().toString()

        val participant = Participant(
            sessionToken = sessionToken,
            role = ParticipantRole.BOOTH_OPERATOR,
            displayName = booth.name
        )
        val saved = participantRepository.save(participant)

        if (booth.operator == null) {
            booth.operator = saved
            booth.updatedAt = Instant.now()
            boothRepository.save(booth)
        }

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
