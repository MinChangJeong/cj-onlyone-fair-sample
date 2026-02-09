package com.cj.onlyonefair.api.controller

import com.cj.onlyonefair.application.dto.ApiResponse
import com.cj.onlyonefair.application.dto.CrowdStatusBroadcast
import com.cj.onlyonefair.application.service.CrowdStatusService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/crowd-status")
class CrowdStatusController(
    private val crowdStatusService: CrowdStatusService
) {
    @GetMapping
    fun getCurrentStatus(): ApiResponse<CrowdStatusBroadcast> {
        return ApiResponse.ok(crowdStatusService.computeCurrentStatus())
    }
}
