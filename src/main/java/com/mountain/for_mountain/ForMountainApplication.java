package com.mountain.for_mountain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class ForMountainApplication {

    public static void main(String[] args) {
        SpringApplication.run(ForMountainApplication.class, args);
    }

}
