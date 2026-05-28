package com.example.northpay_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = com.northpay.backend.Application.class)
@ActiveProfiles("test")
class NorthpayBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
