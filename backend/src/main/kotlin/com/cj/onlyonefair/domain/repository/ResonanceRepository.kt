package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.Resonance
import com.cj.onlyonefair.domain.model.ResonanceType
import org.springframework.data.jpa.repository.JpaRepository

interface ResonanceRepository : JpaRepository<Resonance, Long> {
    fun findByRecordIdAndParticipantIdAndType(
        recordId: Long,
        participantId: Long,
        type: ResonanceType
    ): Resonance?

    fun countByRecordIdAndType(recordId: Long, type: ResonanceType): Long
    fun findByRecordIdAndParticipantId(recordId: Long, participantId: Long): List<Resonance>
}
