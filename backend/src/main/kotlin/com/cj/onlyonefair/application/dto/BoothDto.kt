package com.cj.onlyonefair.application.dto

import com.cj.onlyonefair.domain.model.CrowdLevel
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateBoothRequest(
    @field:NotBlank @field:Size(max = 10) val code: String,
    @field:NotBlank @field:Size(max = 200) val name: String,
    val ideaSummary: String? = null,
    val wrongAssumption: String? = null,
    val trialMoments: String? = null,
    val learningPivot: String? = null,
    val currentState: String? = null,
    val locationDesc: String? = null,
    val keywordIds: List<Long> = emptyList()
)

data class UpdateBoothRequest(
    @field:Size(max = 200) val name: String? = null,
    val ideaSummary: String? = null,
    val wrongAssumption: String? = null,
    val trialMoments: String? = null,
    val learningPivot: String? = null,
    val currentState: String? = null,
    val locationDesc: String? = null,
    val keywordIds: List<Long>? = null
)

data class BoothListResponse(
    val id: Long,
    val code: String,
    val name: String,
    val locationDesc: String?,
    val keywords: List<KeywordResponse>,
    val crowdLevel: CrowdLevel,
    val crowdCount: Int
)

data class BoothDetailResponse(
    val id: Long,
    val code: String,
    val name: String,
    val ideaSummary: String?,
    val wrongAssumption: String?,
    val trialMoments: String?,
    val learningPivot: String?,
    val currentState: String?,
    val locationDesc: String?,
    val keywords: List<KeywordResponse>,
    val crowdLevel: CrowdLevel,
    val crowdCount: Int
)

data class KeywordResponse(
    val id: Long,
    val name: String,
    val nameEn: String?
)
