package com.cj.onlyonefair

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class OnlyOneFairApplication

fun main(args: Array<String>) {
    runApplication<OnlyOneFairApplication>(*args)
}
