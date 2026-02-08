package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "booths")
class Booth(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 10)
    var code: String,

    @Column(nullable = false, length = 200)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    var operator: Participant? = null,

    @Column(name = "idea_summary", columnDefinition = "TEXT")
    var ideaSummary: String? = null,

    @Column(name = "wrong_assumption", columnDefinition = "TEXT")
    var wrongAssumption: String? = null,

    @Column(name = "trial_moments", columnDefinition = "TEXT")
    var trialMoments: String? = null,

    @Column(name = "learning_pivot", columnDefinition = "TEXT")
    var learningPivot: String? = null,

    @Column(name = "current_state", columnDefinition = "TEXT")
    var currentState: String? = null,

    @Column(name = "location_desc", length = 200)
    var locationDesc: String? = null,

    @Column(name = "qr_token", nullable = false, unique = true)
    val qrToken: String,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "booth_keywords",
        joinColumns = [JoinColumn(name = "booth_id")],
        inverseJoinColumns = [JoinColumn(name = "keyword_id")]
    )
    var keywords: MutableSet<GrowthKeyword> = mutableSetOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
