package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "participants")
class Participant(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "session_token", nullable = false, unique = true)
    val sessionToken: String,

    @Column(name = "display_name", length = 100)
    var displayName: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: ParticipantRole = ParticipantRole.PARTICIPANT,

    @Column(name = "onboarding_done", nullable = false)
    var onboardingDone: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "last_active_at", nullable = false)
    var lastActiveAt: Instant = Instant.now()
)
