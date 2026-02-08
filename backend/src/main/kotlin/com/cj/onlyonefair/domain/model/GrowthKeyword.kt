package com.cj.onlyonefair.domain.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "growth_keywords")
class GrowthKeyword(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 50)
    var name: String,

    @Column(name = "name_en", length = 50)
    var nameEn: String? = null,

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
