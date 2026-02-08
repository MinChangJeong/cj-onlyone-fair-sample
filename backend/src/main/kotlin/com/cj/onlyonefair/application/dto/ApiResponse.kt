package com.cj.onlyonefair.application.dto

import java.time.Instant

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val timestamp: Instant = Instant.now()
) {
    companion object {
        fun <T> ok(data: T): ApiResponse<T> = ApiResponse(success = true, data = data)
        fun <T> error(message: String): ApiResponse<T> = ApiResponse(success = false, error = message)
    }
}
