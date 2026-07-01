package com.mountain.for_mountain.domain.leave.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 휴가 관련 알림 메일을 비동기로 발송한다.
 * 트랜잭션 커밋 후(afterCommit) 별도 스레드에서 호출되어, 요청 응답을 지연시키지 않고
 * 롤백/재시도로 인한 중복 발송을 방지한다.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class LeaveMailSender {

    private final JavaMailSender mailSender;

    @Async
    public void send(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send leave mail to {}", to, e);
        }
    }
}
