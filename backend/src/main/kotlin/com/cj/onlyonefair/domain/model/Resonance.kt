package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(
    name = "resonances",
    uniqueConstraints = [UniqueConstraint(columnNames = ["record_id", "participant_id", "type"])]
)
class Resonance(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    val record: LearningRecord,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    val participant: Participant,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20)")
    val type: ResonanceType,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
