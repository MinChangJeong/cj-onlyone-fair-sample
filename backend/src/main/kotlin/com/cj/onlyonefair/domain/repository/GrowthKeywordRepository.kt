package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.GrowthKeyword
import org.springframework.data.jpa.repository.JpaRepository

interface GrowthKeywordRepository : JpaRepository<GrowthKeyword, Long> {
    fun findByIsActiveTrueOrderBySortOrder(): List<GrowthKeyword>
    fun existsByName(name: String): Boolean
}
