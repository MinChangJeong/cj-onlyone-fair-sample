package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.CheckInResponse
import com.cj.onlyonefair.application.dto.CodeCheckInRequest
import com.cj.onlyonefair.application.dto.QrCheckInRequest
import com.cj.onlyonefair.application.service.CheckInService
import com.cj.onlyonefair.domain.model.Participant
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/checkins")
class CheckInController(
    private val checkInService: CheckInService
) {

    @PostMapping("/qr")
    fun checkInByQr(
        @Valid @RequestBody request: QrCheckInRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<CheckInResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = checkInService.checkInByQr(request.qrToken, participant)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    @PostMapping("/code")
    fun checkInByCode(
        @Valid @RequestBody request: CodeCheckInRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<CheckInResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = checkInService.checkInByCode(request.boothCode, participant)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    @GetMapping("/my")
    fun getMyCheckIns(
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<List<CheckInResponse>>> {
        val participant = getCurrentParticipant(authentication)
        val checkIns = checkInService.getMyCheckIns(participant.id)
        return ResponseEntity.ok(ApiResponse.ok(checkIns))
    }

    private fun getCurrentParticipant(authentication: Authentication?): Participant {
        val principal = authentication?.principal
            ?: throw IllegalStateException("인증 정보가 없습니다")
        return principal as Participant
    }
}
