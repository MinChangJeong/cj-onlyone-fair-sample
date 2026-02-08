package com.cj.onlyonefair.application.dto

import com.cj.onlyonefair.domain.model.CrowdLevel
import java.time.Instant

data class BoothCrowdStatus(
    val boothId: Long,
    val code: String,
    val level: CrowdLevel,
    val count: Int
)

data class CrowdStatusBroadcast(
    val booths: List<BoothCrowdStatus>,
    val timestamp: Instant = Instant.now()
)
