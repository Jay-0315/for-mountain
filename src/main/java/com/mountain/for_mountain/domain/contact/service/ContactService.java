package com.mountain.for_mountain.domain.contact.service;

import com.mountain.for_mountain.common.CustomException;
import com.mountain.for_mountain.common.ErrorCode;
import com.mountain.for_mountain.domain.contact.dto.ContactRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.to}")
    private String mailTo;

    public void sendContactMail(ContactRequest request) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(mailTo);
            message.setReplyTo(request.getEmail());
            message.setSubject("【お問い合わせ】" + request.getName() + " 様");
            message.setText(buildMailBody(request));
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send contact email from {}", request.getEmail(), e);
            throw new CustomException(ErrorCode.MAIL_SEND_FAILED);
        }
    }

    private String buildMailBody(ContactRequest req) {
        return String.join("\n",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "株式会社マウンテン お問い合わせフォーム",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "氏名       : " + req.getName(),
            "フリガナ   : " + req.getNameKana(),
            "メール     : " + req.getEmail(),
            "",
            "【お問い合わせ内容】",
            req.getMessage(),
            "",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "このメールはウェブサイトのお問い合わせフォームから自動送信されました。"
        );
    }
}
