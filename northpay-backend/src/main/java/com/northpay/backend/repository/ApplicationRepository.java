package com.northpay.backend.repository;

import com.northpay.backend.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByConvocatoriaId(String convocatoriaId);
    long countByConvocatoriaId(String convocatoriaId);
}
