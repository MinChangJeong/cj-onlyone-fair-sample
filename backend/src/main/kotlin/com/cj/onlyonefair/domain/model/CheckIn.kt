package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(
    name = "check_ins",
    uniqueConstraints = [UniqueConstraint(columnNames = ["participant_id", "booth_id"])]
)
class CheckIn(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    val participant: Participant,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booth_id", nullable = false)
    val booth: Booth,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    val method: CheckInMethod = CheckInMethod.QR,

    @Column(name = "checked_in_at", nullable = false, updatable = false)
    val checkedInAt: Instant = Instant.now()
)
