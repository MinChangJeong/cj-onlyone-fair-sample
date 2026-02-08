package com.cj.onlyonefair.domain.repository

import com.cj.onlyonefair.domain.model.CrowdSnapshot
import org.springframework.data.jpa.repository.JpaRepository

interface CrowdSnapshotRepository : JpaRepository<CrowdSnapshot, Long>
