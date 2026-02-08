package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.CheckIn
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.Instant

interface CheckInRepository : JpaRepository<CheckIn, Long> {
    fun existsByParticipantIdAndBoothId(participantId: Long, boothId: Long): Boolean
    fun findByParticipantIdOrderByCheckedInAtDesc(participantId: Long): List<CheckIn>

    @Query("SELECT c.booth.id, COUNT(c) FROM CheckIn c WHERE c.checkedInAt >= :since GROUP BY c.booth.id")
    fun countByBoothSince(since: Instant): List<Array<Any>>
}
