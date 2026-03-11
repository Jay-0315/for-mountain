package com.mountain.for_mountain.domain.servicecategory.config;

import com.mountain.for_mountain.domain.servicecategory.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ServiceCategoryInitializer {

    private final ServiceCategoryService serviceCategoryService;

    @Bean
    public ApplicationRunner serviceCategorySeeder() {
        return args -> serviceCategoryService.seedDefaults();
    }
}
