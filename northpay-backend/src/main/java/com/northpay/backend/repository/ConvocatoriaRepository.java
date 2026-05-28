package com.northpay.backend.repository;

import com.northpay.backend.model.Convocatoria;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConvocatoriaRepository extends MongoRepository<Convocatoria, String> {
    List<Convocatoria> findByCompanyId(String companyId);
    List<Convocatoria> findByCreatedBy(String userId);
    List<Convocatoria> findByStatus(String status);
}
