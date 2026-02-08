package com.cj.onlyonefair.application.dto

import com.cj.onlyonefair.domain.model.CheckInMethod
import jakarta.validation.constraints.NotBlank
import java.time.Instant

data class QrCheckInRequest(
    @field:NotBlank val qrToken: String
)

data class CodeCheckInRequest(
    @field:NotBlank val boothCode: String
)

data class CheckInResponse(
    val id: Long,
    val boothId: Long,
    val boothCode: String,
    val boothName: String,
    val method: CheckInMethod,
    val checkedInAt: Instant
)
