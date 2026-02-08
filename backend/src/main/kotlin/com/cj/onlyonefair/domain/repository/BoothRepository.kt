package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.Booth
import org.springframework.data.jpa.repository.JpaRepository

interface BoothRepository : JpaRepository<Booth, Long> {
    fun findByIsActiveTrueOrderByCodeAsc(): List<Booth>
    fun findByCode(code: String): Booth?
    fun findByQrToken(qrToken: String): Booth?
    fun existsByCode(code: String): Boolean
}
