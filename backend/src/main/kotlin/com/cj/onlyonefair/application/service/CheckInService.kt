package com.cj.onlyonefair.application.service

import com.cj.onlyonefair.application.dto.CheckInResponse
import com.cj.onlyonefair.domain.model.Booth
import com.cj.onlyonefair.domain.model.CheckIn
import com.cj.onlyonefair.domain.model.CheckInMethod
import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.repository.BoothRepository
import com.cj.onlyonefair.domain.repository.CheckInRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class CheckInService(
    private val checkInRepository: CheckInRepository,
    private val boothRepository: BoothRepository
) {

    fun checkInByQr(qrToken: String, participant: Participant): CheckInResponse {
        val booth = boothRepository.findByQrToken(qrToken)
            ?: throw IllegalArgumentException("Invalid QR token")

        return performCheckIn(booth, participant, CheckInMethod.QR)
    }

    fun checkInByCode(boothCode: String, participant: Participant): CheckInResponse {
        val booth = boothRepository.findByCode(boothCode)
            ?: throw NoSuchElementException("Booth not found with code: $boothCode")

        return performCheckIn(booth, participant, CheckInMethod.MANUAL)
    }

    @Transactional(readOnly = true)
    fun getMyCheckIns(participantId: Long): List<CheckInResponse> {
        return checkInRepository.findByParticipantIdOrderByCheckedInAtDesc(participantId)
            .map { it.toResponse() }
    }

    private fun performCheckIn(booth: Booth, participant: Participant, method: CheckInMethod): CheckInResponse {
        if (!booth.isActive) {
            throw IllegalStateException("Booth '${booth.code}' is not active")
        }

        if (checkInRepository.existsByParticipantIdAndBoothId(participant.id, booth.id)) {
            throw IllegalStateException("Already checked in to booth '${booth.code}'")
        }

        val checkIn = CheckIn(
            participant = participant,
            booth = booth,
            method = method
        )

        val saved = checkInRepository.save(checkIn)
        return saved.toResponse()
    }

    private fun CheckIn.toResponse() = CheckInResponse(
        id = this.id,
        boothId = this.booth.id,
        boothCode = this.booth.code,
        boothName = this.booth.name,
        method = this.method,
        checkedInAt = this.checkedInAt
    )
}
