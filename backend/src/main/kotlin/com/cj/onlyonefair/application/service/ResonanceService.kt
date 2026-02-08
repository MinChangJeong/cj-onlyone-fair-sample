package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.ResonanceResponse
import com.cj.onlyonefair.application.dto.ToggleResonanceRequest
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.model.Resonance
import com.cj.onlyonefair.domain.repository.LearningRecordRepository
import com.cj.onlyonefair.domain.repository.ResonanceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ResonanceService(
    private val resonanceRepository: ResonanceRepository,
    private val learningRecordRepository: LearningRecordRepository
) {

    fun toggle(request: ToggleResonanceRequest, participant: Participant): ResonanceResponse {
        val record = learningRecordRepository.findById(request.recordId)
            .orElseThrow { NoSuchElementException("Learning record not found with id: ${request.recordId}") }

        val existing = resonanceRepository.findByRecordIdAndParticipantIdAndType(
            recordId = request.recordId,
            participantId = participant.id,
            type = request.type
        )

        return if (existing != null) {
            resonanceRepository.delete(existing)
            ResonanceResponse(
                id = existing.id,
                recordId = request.recordId,
                type = request.type,
                toggled = false,
                createdAt = null
            )
        } else {
            val resonance = Resonance(
                record = record,
                participant = participant,
                type = request.type
            )
            val saved = resonanceRepository.save(resonance)
            ResonanceResponse(
                id = saved.id,
                recordId = request.recordId,
                type = request.type,
                toggled = true,
                createdAt = saved.createdAt
            )
        }
    }
}
