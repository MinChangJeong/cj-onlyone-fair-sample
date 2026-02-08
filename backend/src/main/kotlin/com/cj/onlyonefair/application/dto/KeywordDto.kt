package com.cj.onlyonefair.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateKeywordRequest(
    @field:NotBlank @field:Size(max = 50) val name: String,
    @field:Size(max = 50) val nameEn: String? = null,
    val sortOrder: Int = 0
)

data class UpdateKeywordRequest(
    @field:Size(max = 50) val name: String? = null,
    @field:Size(max = 50) val nameEn: String? = null,
    val sortOrder: Int? = null,
    val isActive: Boolean? = null
)
