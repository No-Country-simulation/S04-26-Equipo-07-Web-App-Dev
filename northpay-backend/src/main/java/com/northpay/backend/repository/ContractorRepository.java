package com.northpay.backend.repository;

import com.northpay.backend.model.Contractor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractorRepository extends MongoRepository<Contractor, String> {

}