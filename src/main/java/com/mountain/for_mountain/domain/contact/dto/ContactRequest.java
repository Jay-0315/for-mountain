package com.mountain.for_mountain.domain.contact.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "Contact form submission request")
public class ContactRequest {

    @NotBlank(message = "Name must not be blank")
    @Size(max = 100)
    @Schema(description = "Full name (氏名)", example = "山田 太郎")
    private String name;

    @NotBlank(message = "Name kana must not be blank")
    @Size(max = 100)
    @Schema(description = "Name in katakana (フリガナ)", example = "ヤマダ タロウ")
    private String nameKana;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    @Schema(description = "Email address", example = "yamada@example.com")
    private String email;

    @NotBlank(message = "Message must not be blank")
    @Size(max = 5000, message = "Message must not exceed 5000 characters")
    @Schema(description = "Inquiry message (お問い合わせ内容)", example = "採用について伺いたいことがあります...")
    private String message;
}
