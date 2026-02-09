package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.BoothDetailResponse
import com.cj.onlyonefair.application.dto.BoothListResponse
import com.cj.onlyonefair.application.dto.CreateBoothRequest
import com.cj.onlyonefair.application.dto.LearningRecordResponse
import com.cj.onlyonefair.application.dto.UpdateBoothRequest
import com.cj.onlyonefair.application.service.BoothService
import com.cj.onlyonefair.application.service.LearningRecordService
import com.cj.onlyonefair.domain.model.Participant
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/booths")
class BoothController(
    private val boothService: BoothService,
    private val learningRecordService: LearningRecordService
) {

    @GetMapping
    fun listActiveBooths(): ResponseEntity<ApiResponse<List<BoothListResponse>>> {
        val booths = boothService.getActiveBooths()
        return ResponseEntity.ok(ApiResponse.ok(booths))
    }

    @GetMapping("/{id}")
    fun getBoothDetail(
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<BoothDetailResponse>> {
        val booth = boothService.getBoothById(id)
        return ResponseEntity.ok(ApiResponse.ok(booth))
    }

    @PostMapping
    fun createBooth(
        @Valid @RequestBody request: CreateBoothRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<BoothDetailResponse>> {
        val participant = getCurrentParticipant(authentication)
        val booth = boothService.createBooth(request, participant)
        return ResponseEntity.ok(ApiResponse.ok(booth))
    }

    @PutMapping("/{id}")
    fun updateBooth(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateBoothRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<BoothDetailResponse>> {
        val participant = getCurrentParticipant(authentication)
        val booth = boothService.updateBooth(id, request, participant)
        return ResponseEntity.ok(ApiResponse.ok(booth))
    }

    @GetMapping("/{id}/learning-records")
    fun getLearningRecordsForBooth(
        @PathVariable id: Long,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<List<LearningRecordResponse>>> {
        val participant = getCurrentParticipant(authentication)
        val records = learningRecordService.getByBooth(id, participant.id)
        return ResponseEntity.ok(ApiResponse.ok(records))
    }

    private fun getCurrentParticipant(authentication: Authentication?): Participant {
        val principal = authentication?.principal
            ?: throw IllegalStateException("인증 정보가 없습니다")
        return principal as Participant
    }
}
