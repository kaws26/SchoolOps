package com.schoolOps.SchoolOPS.service;


import java.util.List;

import com.schoolOps.SchoolOPS.entity.Enquery;
import com.schoolOps.SchoolOPS.repository.EnqueryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EnqueryService {

    private final EnqueryRepository enqueryRepository;

    // ---------- CREATE ----------
    public Enquery saveEnquery(Enquery enquery) {
        Enquery saved = enqueryRepository.save(enquery);
        log.info("Enquery saved | id={}", saved.getId());
        return saved;
    }

    // ---------- READ ----------
    public List<Enquery> getAllEnquery() {
        return enqueryRepository.findAll();
    }

    // ---------- DELETE ----------
    public void deleteEnquery(Long id) {
        if (!enqueryRepository.existsById(id)) {
            throw new EntityNotFoundException("Enquery not found with id: " + id);
        }
        enqueryRepository.deleteById(id);
        log.info("Enquery deleted | id={}", id);
    }

    // ---------- UPDATE STATUS ----------
    public void setEnqueryStatus(Long enqueryId, String status) {

        Enquery enquery = enqueryRepository.findById(enqueryId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Enquery not found with id: " + enqueryId)
                );

        enquery.setStatus(status);
        enqueryRepository.save(enquery);

        log.info("Enquery status updated | id={} | status={}", enqueryId, status);
    }
}

