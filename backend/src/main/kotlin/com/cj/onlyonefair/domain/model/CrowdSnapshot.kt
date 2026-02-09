package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "crowd_snapshots")
class CrowdSnapshot(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    val booth: Booth,

    @Column(name = "head_count", nullable = false)
    val headCount: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(10)")
    val level: CrowdLevel = CrowdLevel.LOW,

    @Column(name = "recorded_at", nullable = false, updatable = false)
    val recordedAt: Instant = Instant.now()
)
