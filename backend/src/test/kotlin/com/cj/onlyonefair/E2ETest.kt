package com.cj.onlyonefair

import com.cj.onlyonefair.application.dto.*
import com.cj.onlyonefair.domain.model.CheckInMethod
import com.cj.onlyonefair.domain.model.ParticipantRole
import com.cj.onlyonefair.domain.model.ResonanceType
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.testcontainers.containers.MySQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation::class)
class E2ETest {

    companion object {
        @Container
        @JvmStatic
        val mysql = MySQLContainer("mysql:8.0").apply {
            withDatabaseName("onlyonefair_test")
            withUsername("test")
            withPassword("test")
            withCommand("--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci", "--default-time-zone=+00:00")
        }

        @DynamicPropertySource
        @JvmStatic
        fun configureProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url") { mysql.jdbcUrl + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8" }
            registry.add("spring.datasource.username") { mysql.username }
            registry.add("spring.datasource.password") { mysql.password }
        }

        // Shared state across ordered tests
        var sessionToken: String? = null
        var boothId: Long = 0
        var learningRecordId: Long = 0
    }

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var objectMapper: ObjectMapper

    private fun toJson(obj: Any): String = objectMapper.writeValueAsString(obj)

    // =========================================================
    // 1. Auth
    // =========================================================

    @Test
    @Order(1)
    fun `QR 인증으로 세션 생성`() {
        val result = mockMvc.perform(
            post("/api/v1/auth/qr")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(QrAuthRequest(qrToken = "test-entry-qr")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.sessionToken").exists())
            .andExpect(jsonPath("$.data.role").value("PARTICIPANT"))
            .andExpect(jsonPath("$.data.onboardingDone").value(false))
            .andReturn()

        val body = objectMapper.readValue<Map<String, Any>>(result.response.contentAsString)
        @Suppress("UNCHECKED_CAST")
        val data = body["data"] as Map<String, Any>
        sessionToken = data["sessionToken"] as String
        assertNotNull(sessionToken)
    }

    @Test
    @Order(2)
    fun `현재 사용자 조회`() {
        mockMvc.perform(
            get("/api/v1/auth/me")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.role").value("PARTICIPANT"))
            .andExpect(jsonPath("$.data.onboardingDone").value(false))
    }

    @Test
    @Order(3)
    fun `온보딩 완료`() {
        mockMvc.perform(
            post("/api/v1/auth/onboarding-complete")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }

    @Test
    @Order(4)
    fun `온보딩 완료 후 사용자 조회`() {
        mockMvc.perform(
            get("/api/v1/auth/me")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.onboardingDone").value(true))
    }

    // =========================================================
    // 2. Keywords (seed data from V1 migration)
    // =========================================================

    @Test
    @Order(10)
    fun `시드 키워드 목록 조회`() {
        mockMvc.perform(get("/api/v1/keywords"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(5))
            .andExpect(jsonPath("$.data[0].name").value("기획"))
    }

    @Test
    @Order(11)
    fun `키워드 생성`() {
        mockMvc.perform(
            post("/api/v1/keywords")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(CreateKeywordRequest(name = "리더십", nameEn = "Leadership", sortOrder = 6)))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("리더십"))
            .andExpect(jsonPath("$.data.nameEn").value("Leadership"))
    }

    @Test
    @Order(12)
    fun `중복 키워드 생성 실패`() {
        mockMvc.perform(
            post("/api/v1/keywords")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(CreateKeywordRequest(name = "기획")))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
    }

    // =========================================================
    // 3. Booths
    // =========================================================

    @Test
    @Order(20)
    fun `부스 생성`() {
        val result = mockMvc.perform(
            post("/api/v1/booths")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(
                    toJson(
                        CreateBoothRequest(
                            code = "A001",
                            name = "CJ대한통운 글로벌 진출",
                            ideaSummary = "글로벌 진출 전략",
                            wrongAssumption = "초기 가정의 오류",
                            trialMoments = "시행착오 순간들",
                            learningPivot = "배움과 전환",
                            currentState = "현재 상태",
                            locationDesc = "A구역 1번",
                            keywordIds = listOf(1, 2)
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.code").value("A001"))
            .andExpect(jsonPath("$.data.name").value("CJ대한통운 글로벌 진출"))
            .andExpect(jsonPath("$.data.keywords.length()").value(2))
            .andReturn()

        val body = objectMapper.readValue<Map<String, Any>>(result.response.contentAsString)
        @Suppress("UNCHECKED_CAST")
        val data = body["data"] as Map<String, Any>
        boothId = (data["id"] as Number).toLong()
        assertTrue(boothId > 0)
    }

    @Test
    @Order(21)
    fun `부스 목록 조회`() {
        mockMvc.perform(get("/api/v1/booths"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].code").value("A001"))
    }

    @Test
    @Order(22)
    fun `부스 상세 조회`() {
        mockMvc.perform(get("/api/v1/booths/$boothId"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(boothId))
            .andExpect(jsonPath("$.data.ideaSummary").value("글로벌 진출 전략"))
    }

    @Test
    @Order(23)
    fun `부스 수정`() {
        mockMvc.perform(
            put("/api/v1/booths/$boothId")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(UpdateBoothRequest(name = "CJ대한통운 글로벌 물류")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.name").value("CJ대한통운 글로벌 물류"))
    }

    // =========================================================
    // 4. Check-in
    // =========================================================

    @Test
    @Order(30)
    fun `수동 코드 체크인`() {
        mockMvc.perform(
            post("/api/v1/checkins/code")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(CodeCheckInRequest(boothCode = "A001")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.boothCode").value("A001"))
            .andExpect(jsonPath("$.data.method").value("MANUAL"))
    }

    @Test
    @Order(31)
    fun `중복 체크인 실패`() {
        mockMvc.perform(
            post("/api/v1/checkins/code")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(CodeCheckInRequest(boothCode = "A001")))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
    }

    @Test
    @Order(32)
    fun `내 체크인 목록 조회`() {
        mockMvc.perform(
            get("/api/v1/checkins/my")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
    }

    // =========================================================
    // 5. Learning Records
    // =========================================================

    @Test
    @Order(40)
    fun `학습 기록 작성`() {
        val result = mockMvc.perform(
            post("/api/v1/learning-records")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(
                    toJson(
                        CreateLearningRecordRequest(
                            boothId = boothId,
                            content = "글로벌 물류의 시행착오에서 배운 점",
                            keywordIds = listOf(1, 3)
                        )
                    )
                )
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").value("글로벌 물류의 시행착오에서 배운 점"))
            .andExpect(jsonPath("$.data.keywords.length()").value(2))
            .andReturn()

        val body = objectMapper.readValue<Map<String, Any>>(result.response.contentAsString)
        @Suppress("UNCHECKED_CAST")
        val data = body["data"] as Map<String, Any>
        learningRecordId = (data["id"] as Number).toLong()
        assertTrue(learningRecordId > 0)
    }

    @Test
    @Order(41)
    fun `학습 기록 수정`() {
        mockMvc.perform(
            put("/api/v1/learning-records/$learningRecordId")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(UpdateLearningRecordRequest(content = "수정된 배움의 기록")))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.content").value("수정된 배움의 기록"))
    }

    @Test
    @Order(42)
    fun `학습 기록 단건 조회`() {
        mockMvc.perform(
            get("/api/v1/learning-records/$learningRecordId")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.id").value(learningRecordId))
            .andExpect(jsonPath("$.data.content").value("수정된 배움의 기록"))
    }

    @Test
    @Order(43)
    fun `내 학습 기록 목록 조회`() {
        mockMvc.perform(
            get("/api/v1/learning-records/my")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
    }

    @Test
    @Order(44)
    fun `부스별 학습 기록 조회`() {
        mockMvc.perform(
            get("/api/v1/booths/$boothId/learning-records")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.length()").value(1))
    }

    // =========================================================
    // 6. Resonance
    // =========================================================

    @Test
    @Order(50)
    fun `공감 토글 - 응원해요 켜기`() {
        mockMvc.perform(
            post("/api/v1/resonances")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(ToggleResonanceRequest(recordId = learningRecordId, type = ResonanceType.SUPPORT)))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.toggled").value(true))
            .andExpect(jsonPath("$.data.type").value("SUPPORT"))
    }

    @Test
    @Order(51)
    fun `공감 후 학습 기록에 카운트 반영 확인`() {
        mockMvc.perform(
            get("/api/v1/learning-records/$learningRecordId")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.supportCount").value(1))
            .andExpect(jsonPath("$.data.myResonances[0]").value("SUPPORT"))
    }

    @Test
    @Order(52)
    fun `공감 토글 - 응원해요 끄기`() {
        mockMvc.perform(
            post("/api/v1/resonances")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer $sessionToken")
                .content(toJson(ToggleResonanceRequest(recordId = learningRecordId, type = ResonanceType.SUPPORT)))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.data.toggled").value(false))
    }

    // =========================================================
    // 7. Learning Record Delete
    // =========================================================

    @Test
    @Order(60)
    fun `학습 기록 삭제`() {
        mockMvc.perform(
            delete("/api/v1/learning-records/$learningRecordId")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }

    @Test
    @Order(61)
    fun `삭제된 학습 기록 조회 실패`() {
        mockMvc.perform(
            get("/api/v1/learning-records/$learningRecordId")
                .header("Authorization", "Bearer $sessionToken")
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.success").value(false))
    }

    // =========================================================
    // 8. Crowd Status
    // =========================================================

    @Test
    @Order(70)
    fun `군중 현황 REST 조회`() {
        mockMvc.perform(get("/api/v1/crowd-status"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.booths").isArray)
    }
}
