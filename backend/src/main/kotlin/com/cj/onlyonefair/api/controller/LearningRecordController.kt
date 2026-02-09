package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.CreateLearningRecordRequest
import com.cj.onlyonefair.application.dto.LearningRecordResponse
import com.cj.onlyonefair.application.dto.UpdateLearningRecordRequest
import com.cj.onlyonefair.application.service.LearningRecordService
import com.cj.onlyonefair.domain.model.Participant
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/learning-records")
class LearningRecordController(
    private val learningRecordService: LearningRecordService
) {

    @PostMapping
    fun createRecord(
        @Valid @RequestBody request: CreateLearningRecordRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<LearningRecordResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = learningRecordService.create(request, participant)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    @PutMapping("/{id}")
    fun updateRecord(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateLearningRecordRequest,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<LearningRecordResponse>> {
        val participant = getCurrentParticipant(authentication)
        val response = learningRecordService.update(id, request, participant)
        return ResponseEntity.ok(ApiResponse.ok(response))
    }

    @DeleteMapping("/{id}")
    fun deleteRecord(
        @PathVariable id: Long,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<Unit>> {
        val participant = getCurrentParticipant(authentication)
        learningRecordService.delete(id, participant)
        return ResponseEntity.ok(ApiResponse.ok(Unit))
    }

    @GetMapping("/my")
    fun getMyRecords(
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<List<LearningRecordResponse>>> {
        val participant = getCurrentParticipant(authentication)
        val records = learningRecordService.getMyRecords(participant.id)
        return ResponseEntity.ok(ApiResponse.ok(records))
    }

    @GetMapping("/{id}")
    fun getRecord(
        @PathVariable id: Long,
        authentication: Authentication?
    ): ResponseEntity<ApiResponse<LearningRecordResponse>> {
        val participant = getCurrentParticipant(authentication)
        val record = learningRecordService.getById(id, participant.id)
        return ResponseEntity.ok(ApiResponse.ok(record))
    }

    private fun getCurrentParticipant(authentication: Authentication?): Participant {
        val principal = authentication?.principal
            ?: throw IllegalStateException("인증 정보가 없습니다")
        return principal as Participant
    }
}
