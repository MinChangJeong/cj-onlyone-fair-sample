package com.cj.onlyonefair.application.dto

import com.cj.onlyonefair.domain.model.ResonanceType
import java.time.Instant

data class ToggleResonanceRequest(
    val recordId: Long,
    val type: ResonanceType
)

data class ResonanceResponse(
    val id: Long,
    val recordId: Long,
    val type: ResonanceType,
    val toggled: Boolean,
    val createdAt: Instant?
)
