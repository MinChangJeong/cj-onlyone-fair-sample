package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.CreateLearningRecordRequest
import com.cj.onlyonefair.application.dto.KeywordResponse
import com.cj.onlyonefair.application.dto.LearningRecordResponse
import com.cj.onlyonefair.application.dto.UpdateLearningRecordRequest
import com.cj.onlyonefair.domain.model.LearningRecord
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.model.ResonanceType
import com.cj.onlyonefair.domain.repository.BoothRepository
import com.cj.onlyonefair.domain.repository.GrowthKeywordRepository
import com.cj.onlyonefair.domain.repository.LearningRecordRepository
import com.cj.onlyonefair.domain.repository.ResonanceRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class LearningRecordService(
    private val learningRecordRepository: LearningRecordRepository,
    private val boothRepository: BoothRepository,
    private val growthKeywordRepository: GrowthKeywordRepository,
    private val resonanceRepository: ResonanceRepository
) {

    fun create(request: CreateLearningRecordRequest, participant: Participant): LearningRecordResponse {
        val booth = boothRepository.findById(request.boothId)
            .orElseThrow { NoSuchElementException("Booth not found with id: ${request.boothId}") }

        val keywords = growthKeywordRepository.findAllById(request.keywordIds).toMutableSet()

        val record = LearningRecord(
            participant = participant,
            booth = booth,
            content = request.content,
            keywords = keywords
        )

        val saved = learningRecordRepository.save(record)
        return toResponse(saved, participant.id)
    }

    fun update(id: Long, request: UpdateLearningRecordRequest, participant: Participant): LearningRecordResponse {
        val record = learningRecordRepository.findById(id)
            .orElseThrow { NoSuchElementException("Learning record not found with id: $id") }

        if (record.participant.id != participant.id) {
            throw IllegalStateException("Only the author can update this learning record")
        }

        request.content?.let { record.content = it }

        request.keywordIds?.let { ids ->
            val keywords = growthKeywordRepository.findAllById(ids).toMutableSet()
            record.keywords = keywords
        }

        record.updatedAt = Instant.now()
        val saved = learningRecordRepository.save(record)
        return toResponse(saved, participant.id)
    }

    fun delete(id: Long, participant: Participant) {
        val record = learningRecordRepository.findById(id)
            .orElseThrow { NoSuchElementException("Learning record not found with id: $id") }

        if (record.participant.id != participant.id) {
            throw IllegalStateException("Only the author can delete this learning record")
        }

        learningRecordRepository.delete(record)
    }

    @Transactional(readOnly = true)
    fun getByBooth(boothId: Long, currentParticipantId: Long): List<LearningRecordResponse> {
        if (!boothRepository.existsById(boothId)) {
            throw NoSuchElementException("Booth not found with id: $boothId")
        }

        return learningRecordRepository.findByBoothIdOrderByCreatedAtDesc(boothId)
            .map { toResponse(it, currentParticipantId) }
    }

    @Transactional(readOnly = true)
    fun getMyRecords(participantId: Long): List<LearningRecordResponse> {
        return learningRecordRepository.findByParticipantIdOrderByCreatedAtDesc(participantId)
            .map { toResponse(it, participantId) }
    }

    @Transactional(readOnly = true)
    fun getById(id: Long, currentParticipantId: Long): LearningRecordResponse {
        val record = learningRecordRepository.findById(id)
            .orElseThrow { NoSuchElementException("Learning record not found with id: $id") }

        return toResponse(record, currentParticipantId)
    }

    private fun toResponse(record: LearningRecord, currentParticipantId: Long): LearningRecordResponse {
        val supportCount = resonanceRepository.countByRecordIdAndType(record.id, ResonanceType.SUPPORT)
        val sharedExperienceCount = resonanceRepository.countByRecordIdAndType(record.id, ResonanceType.SHARED_EXPERIENCE)

        val myResonances = resonanceRepository.findByRecordIdAndParticipantId(record.id, currentParticipantId)
            .map { it.type.name }

        return LearningRecordResponse(
            id = record.id,
            boothId = record.booth.id,
            boothName = record.booth.name,
            participantId = record.participant.id,
            participantName = record.participant.displayName,
            content = record.content,
            keywords = record.keywords.map { keyword ->
                KeywordResponse(
                    id = keyword.id,
                    name = keyword.name,
                    nameEn = keyword.nameEn
                )
            },
            supportCount = supportCount,
            sharedExperienceCount = sharedExperienceCount,
            myResonances = myResonances,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt
        )
    }
}
