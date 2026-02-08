package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "learning_records")
class LearningRecord(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    val participant: Participant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    val booth: Booth,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(name = "is_released", nullable = false)
    var isReleased: Boolean = false,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "learning_record_keywords",
        joinColumns = [JoinColumn(name = "record_id")],
        inverseJoinColumns = [JoinColumn(name = "keyword_id")]
    )
    var keywords: MutableSet<GrowthKeyword> = mutableSetOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
