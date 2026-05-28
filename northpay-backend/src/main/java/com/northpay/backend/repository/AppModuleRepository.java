package com.northpay.backend.repository;

import com.northpay.backend.model.AppModule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppModuleRepository extends MongoRepository<AppModule, String> {
    List<AppModule> findByGroupOrderByOrderAsc(String group);
    List<AppModule> findByActiveTrue();
    Optional<AppModule> findByPath(String path);
}
