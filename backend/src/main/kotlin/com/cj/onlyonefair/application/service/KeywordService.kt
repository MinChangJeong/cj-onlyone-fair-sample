package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.CreateKeywordRequest
import com.cj.onlyonefair.application.dto.KeywordResponse
import com.cj.onlyonefair.application.dto.UpdateKeywordRequest
import com.cj.onlyonefair.domain.model.GrowthKeyword
import com.cj.onlyonefair.domain.repository.GrowthKeywordRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class KeywordService(
    private val growthKeywordRepository: GrowthKeywordRepository
) {

    @Transactional(readOnly = true)
    fun getActiveKeywords(): List<KeywordResponse> {
        return growthKeywordRepository.findByIsActiveTrueOrderBySortOrder()
            .map { it.toResponse() }
    }

    fun create(request: CreateKeywordRequest): KeywordResponse {
        if (growthKeywordRepository.existsByName(request.name)) {
            throw IllegalArgumentException("Keyword with name '${request.name}' already exists")
        }

        val keyword = GrowthKeyword(
            name = request.name,
            nameEn = request.nameEn,
            sortOrder = request.sortOrder
        )

        val saved = growthKeywordRepository.save(keyword)
        return saved.toResponse()
    }

    fun update(id: Long, request: UpdateKeywordRequest): KeywordResponse {
        val keyword = growthKeywordRepository.findById(id)
            .orElseThrow { NoSuchElementException("Keyword not found with id: $id") }

        request.name?.let { newName ->
            if (newName != keyword.name && growthKeywordRepository.existsByName(newName)) {
                throw IllegalArgumentException("Keyword with name '$newName' already exists")
            }
            keyword.name = newName
        }

        request.nameEn?.let { keyword.nameEn = it }
        request.sortOrder?.let { keyword.sortOrder = it }
        request.isActive?.let { keyword.isActive = it }

        keyword.updatedAt = Instant.now()
        val saved = growthKeywordRepository.save(keyword)
        return saved.toResponse()
    }

    fun delete(id: Long) {
        val keyword = growthKeywordRepository.findById(id)
            .orElseThrow { NoSuchElementException("Keyword not found with id: $id") }

        keyword.isActive = false
        keyword.updatedAt = Instant.now()
        growthKeywordRepository.save(keyword)
    }

    private fun GrowthKeyword.toResponse() = KeywordResponse(
        id = this.id,
        name = this.name,
        nameEn = this.nameEn
    )
}
