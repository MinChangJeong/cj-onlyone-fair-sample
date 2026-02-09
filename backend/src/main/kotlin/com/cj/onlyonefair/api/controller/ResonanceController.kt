package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.ResonanceResponse
import com.cj.onlyonefair.application.dto.ToggleResonanceRequest
import com.cj.onlyonefair.application.service.ResonanceService
import com.cj.onlyonefair.domain.model.Participant
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/resonances")
class ResonanceController(
    private val resonanceService: ResonanceService
) {

    @PostMapping
    fun toggleResonance(
        @Valid @RequestBody request: ToggleResonanceRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<ResonanceResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = resonanceService.toggle(request, participant)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    private fun getCurrentParticipant(authentication: Authentication?): Participant {
        val principal = authentication?.principal
            ?: throw IllegalStateException("인증 정보가 없습니다")
        return principal as Participant
    }
}
