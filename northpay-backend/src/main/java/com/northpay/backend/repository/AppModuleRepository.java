package com.northpay.backend.repository;

import com.northpay.backend.model.AppModule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppModuleRepository extends MongoRepository<AppModule, String> {
    List<AppModule> findByGroupOrderByOrderAsc(String group);
    List<AppModule> findByActiveTrue();
}
