package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.BoothCrowdStatus
import com.cj.onlyonefair.application.dto.CrowdStatusBroadcast
import com.cj.onlyonefair.domain.model.CrowdLevel
import com.cj.onlyonefair.domain.repository.BoothRepository
import com.cj.onlyonefair.domain.repository.CheckInRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.temporal.ChronoUnit

@Service
class CrowdStatusService(
    private val boothRepository: BoothRepository,
    private val checkInRepository: CheckInRepository,
    private val messagingTemplate: SimpMessagingTemplate,
    @Value("\${crowd.thresholds.medium:10}") private val crowdMediumThreshold: Int,
    @Value("\${crowd.thresholds.high:25}") private val crowdHighThreshold: Int,
    @Value("\${crowd.window-minutes:30}") private val crowdWindowMinutes: Long
) {

    @Transactional(readOnly = true)
    fun computeCurrentStatus(): CrowdStatusBroadcast {
        val since = Instant.now().minus(crowdWindowMinutes, ChronoUnit.MINUTES)
        val checkInCounts = checkInRepository.countByBoothSince(since)

        val countMap = checkInCounts.associate { row ->
            val boothId = row[0] as Long
            val count = (row[1] as Long).toInt()
            boothId to count
        }

        val activeBooths = boothRepository.findByIsActiveTrueOrderByCodeAsc()

        val boothStatuses = activeBooths.map { booth ->
            val count = countMap[booth.id] ?: 0
            val level = determineCrowdLevel(count)
            BoothCrowdStatus(
                boothId = booth.id,
                code = booth.code,
                level = level,
                count = count
            )
        }

        return CrowdStatusBroadcast(booths = boothStatuses)
    }

    @Scheduled(fixedRateString = "\${crowd.broadcast-interval-seconds:15}000")
    fun broadcastCrowdStatus() {
        val broadcast = computeCurrentStatus()
        messagingTemplate.convertAndSend("/topic/crowd-status", broadcast)
    }

    private fun determineCrowdLevel(count: Int): CrowdLevel {
        return when {
            count >= crowdHighThreshold -> CrowdLevel.HIGH
            count >= crowdMediumThreshold -> CrowdLevel.MEDIUM
            else -> CrowdLevel.LOW
        }
    }
}
