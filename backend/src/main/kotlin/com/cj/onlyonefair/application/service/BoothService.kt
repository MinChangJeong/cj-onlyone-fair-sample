package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.BoothDetailResponse
import com.cj.onlyonefair.application.dto.BoothListResponse
import com.cj.onlyonefair.application.dto.CreateBoothRequest
import com.cj.onlyonefair.application.dto.KeywordResponse
import com.cj.onlyonefair.application.dto.UpdateBoothRequest
import com.cj.onlyonefair.domain.model.Booth
import com.cj.onlyonefair.domain.model.CrowdLevel
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.repository.BoothRepository
import com.cj.onlyonefair.domain.repository.CheckInRepository
import com.cj.onlyonefair.domain.repository.GrowthKeywordRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
@Transactional
class BoothService(
    private val boothRepository: BoothRepository,
    private val checkInRepository: CheckInRepository,
    private val growthKeywordRepository: GrowthKeywordRepository,
    @Value("\${crowd.thresholds.medium:10}") private val crowdMediumThreshold: Int,
    @Value("\${crowd.thresholds.high:25}") private val crowdHighThreshold: Int,
    @Value("\${crowd.window-minutes:30}") private val crowdWindowMinutes: Long
) {

    @Transactional(readOnly = true)
    fun getActiveBooths(): List<BoothListResponse> {
        val booths = boothRepository.findByIsActiveTrueOrderByCodeAsc()
        val crowdData = getCrowdDataMap()

        return booths.map { booth ->
            val count = crowdData[booth.id] ?: 0
            val level = determineCrowdLevel(count)
            BoothListResponse(
                id = booth.id,
                code = booth.code,
                name = booth.name,
                locationDesc = booth.locationDesc,
                keywords = booth.keywords.map { it.toKeywordResponse() },
                crowdLevel = level,
                crowdCount = count
            )
        }
    }

    @Transactional(readOnly = true)
    fun getBoothById(id: Long): BoothDetailResponse {
        val booth = boothRepository.findById(id)
            .orElseThrow { NoSuchElementException("Booth not found with id: $id") }

        val crowdData = getCrowdDataMap()
        val count = crowdData[booth.id] ?: 0
        val level = determineCrowdLevel(count)

        return booth.toDetailResponse(level, count)
    }

    fun createBooth(request: CreateBoothRequest, operator: Participant): BoothDetailResponse {
        if (boothRepository.existsByCode(request.code)) {
            throw IllegalArgumentException("Booth code '${request.code}' already exists")
        }

        val keywords = if (request.keywordIds.isNotEmpty()) {
            growthKeywordRepository.findAllById(request.keywordIds).toMutableSet()
        } else {
            mutableSetOf()
        }

        val booth = Booth(
            code = request.code,
            name = request.name,
            operator = operator,
            ideaSummary = request.ideaSummary,
            wrongAssumption = request.wrongAssumption,
            trialMoments = request.trialMoments,
            learningPivot = request.learningPivot,
            currentState = request.currentState,
            locationDesc = request.locationDesc,
            qrToken = UUID.randomUUID().toString(),
            keywords = keywords
        )

        val saved = boothRepository.save(booth)
        return saved.toDetailResponse(CrowdLevel.LOW, 0)
    }

    fun updateBooth(id: Long, request: UpdateBoothRequest, operator: Participant): BoothDetailResponse {
        val booth = boothRepository.findById(id)
            .orElseThrow { NoSuchElementException("Booth not found with id: $id") }

        if (booth.operator?.id != operator.id) {
            throw IllegalStateException("Only the booth operator can update this booth")
        }

        request.name?.let { booth.name = it }
        request.ideaSummary?.let { booth.ideaSummary = it }
        request.wrongAssumption?.let { booth.wrongAssumption = it }
        request.trialMoments?.let { booth.trialMoments = it }
        request.learningPivot?.let { booth.learningPivot = it }
        request.currentState?.let { booth.currentState = it }
        request.locationDesc?.let { booth.locationDesc = it }

        request.keywordIds?.let { ids ->
            val keywords = growthKeywordRepository.findAllById(ids).toMutableSet()
            booth.keywords = keywords
        }

        booth.updatedAt = Instant.now()
        val saved = boothRepository.save(booth)

        val crowdData = getCrowdDataMap()
        val count = crowdData[saved.id] ?: 0
        val level = determineCrowdLevel(count)

        return saved.toDetailResponse(level, count)
    }

    private fun getCrowdDataMap(): Map<Long, Int> {
        val since = Instant.now().minus(crowdWindowMinutes, ChronoUnit.MINUTES)
        val rawData = checkInRepository.countByBoothSince(since)

        return rawData.associate { row ->
            val boothId = row[0] as Long
            val count = (row[1] as Long).toInt()
            boothId to count
        }
    }

    private fun determineCrowdLevel(count: Int): CrowdLevel {
        return when {
            count >= crowdHighThreshold -> CrowdLevel.HIGH
            count >= crowdMediumThreshold -> CrowdLevel.MEDIUM
            else -> CrowdLevel.LOW
        }
    }

    private fun Booth.toDetailResponse(crowdLevel: CrowdLevel, crowdCount: Int) = BoothDetailResponse(
        id = this.id,
        code = this.code,
        name = this.name,
        ideaSummary = this.ideaSummary,
        wrongAssumption = this.wrongAssumption,
        trialMoments = this.trialMoments,
        learningPivot = this.learningPivot,
        currentState = this.currentState,
        locationDesc = this.locationDesc,
        keywords = this.keywords.map { it.toKeywordResponse() },
        crowdLevel = crowdLevel,
        crowdCount = crowdCount
    )
}

private fun com.cj.onlyonefair.domain.model.GrowthKeyword.toKeywordResponse() = KeywordResponse(
    id = this.id,
    name = this.name,
    nameEn = this.nameEn
)
