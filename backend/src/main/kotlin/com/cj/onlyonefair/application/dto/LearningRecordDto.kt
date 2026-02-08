package com.cj.onlyonefair.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import java.time.Instant

data class CreateLearningRecordRequest(
    val boothId: Long,
    @field:NotBlank val content: String,
    @field:NotEmpty val keywordIds: List<Long>
)

data class UpdateLearningRecordRequest(
    val content: String? = null,
    val keywordIds: List<Long>? = null
)

data class LearningRecordResponse(
    val id: Long,
    val boothId: Long,
    val boothName: String,
    val participantId: Long,
    val participantName: String?,
    val content: String,
    val keywords: List<KeywordResponse>,
    val supportCount: Long,
    val sharedExperienceCount: Long,
    val myResonances: List<String>,
    val createdAt: Instant,
    val updatedAt: Instant
)
