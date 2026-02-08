package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.LearningRecord
import org.springframework.data.jpa.repository.JpaRepository

interface LearningRecordRepository : JpaRepository<LearningRecord, Long> {
    fun findByBoothIdOrderByCreatedAtDesc(boothId: Long): List<LearningRecord>
    fun findByParticipantIdOrderByCreatedAtDesc(participantId: Long): List<LearningRecord>
}
