package com.cj.onlyonefair.infrastructure.config

import com.cj.onlyonefair.domain.model.Participant
import com.cj.onlyonefair.domain.model.ParticipantRole
import com.cj.onlyonefair.domain.repository.ParticipantRepository
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class SessionTokenAuthFilter(
    private val participantRepository: ParticipantRepository
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")

        // TODO: 개발 완료 후 dev fallback 제거
        val participant: Participant? = if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            participantRepository.findBySessionToken(token) ?: getOrCreateDevParticipant()
        } else {
            getOrCreateDevParticipant()
        }

        if (participant != null) {
            val authorities = when (participant.role) {
                ParticipantRole.PARTICIPANT -> listOf(
                    SimpleGrantedAuthority("ROLE_PARTICIPANT")
                )
                ParticipantRole.BOOTH_OPERATOR -> listOf(
                    SimpleGrantedAuthority("ROLE_BOOTH_OPERATOR"),
                    SimpleGrantedAuthority("ROLE_PARTICIPANT")
                )
                ParticipantRole.ADMIN -> listOf(
                    SimpleGrantedAuthority("ROLE_ADMIN"),
                    SimpleGrantedAuthority("ROLE_BOOTH_OPERATOR"),
                    SimpleGrantedAuthority("ROLE_PARTICIPANT")
                )
            }

            val authentication = UsernamePasswordAuthenticationToken(
                participant,
                null,
                authorities
            )

            SecurityContextHolder.getContext().authentication = authentication
        }

        filterChain.doFilter(request, response)
    }

    private fun getOrCreateDevParticipant(): Participant {
        return participantRepository.findBySessionToken("dev-participant")
            ?: participantRepository.save(
                Participant(
                    sessionToken = "dev-participant",
                    displayName = "Dev Admin",
                    role = ParticipantRole.ADMIN,
                    onboardingDone = true
                )
            )
    }
}
