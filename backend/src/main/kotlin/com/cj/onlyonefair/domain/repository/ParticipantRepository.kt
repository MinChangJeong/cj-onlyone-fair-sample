package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.Participant
import org.springframework.data.jpa.repository.JpaRepository

interface ParticipantRepository : JpaRepository<Participant, Long> {
    fun findBySessionToken(sessionToken: String): Participant?
}
