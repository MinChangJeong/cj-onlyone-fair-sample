package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.*
import com.cj.onlyonefair.application.service.KeywordService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/keywords")
class KeywordController(
    private val keywordService: KeywordService
) {
    @GetMapping
    fun getActiveKeywords(): ApiResponse<List<KeywordResponse>> {
        return ApiResponse.ok(keywordService.getActiveKeywords())
    }

    @PostMapping
    fun createKeyword(@Valid @RequestBody request: CreateKeywordRequest): ApiResponse<KeywordResponse> {
        return ApiResponse.ok(keywordService.create(request))
    }

    @PutMapping("/{id}")
    fun updateKeyword(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateKeywordRequest
    ): ApiResponse<KeywordResponse> {
        return ApiResponse.ok(keywordService.update(id, request))
    }

    @DeleteMapping("/{id}")
    fun deleteKeyword(@PathVariable id: Long): ApiResponse<Unit> {
        keywordService.delete(id)
        return ApiResponse.ok(Unit)
    }
}
