package com.schoolOps.SchoolOPS.service;


import java.time.LocalDate;
import java.util.List;

import com.schoolOps.SchoolOPS.entity.Gallery;
import com.schoolOps.SchoolOPS.repository.GalleryRepository;
import com.schoolOps.SchoolOPS.utils.SaveFile;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GalleryService {

    private final GalleryRepository galleryRepository;

    // ---------- CREATE ----------
    public Gallery saveToGallery(Gallery gallery, MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Gallery image file must not be empty");
        }

        String savedFileName = SaveFile.saveFile(file);
        gallery.setPic(savedFileName);
        gallery.setDate(LocalDate.now());

        Gallery saved = galleryRepository.save(gallery);

        log.info("Gallery entry created | id={}", saved.getId());
        return saved;
    }

    // ---------- READ ----------
    public List<Gallery> getAll() {
        return galleryRepository.findAll();
    }

    public List<Gallery> getAllByDate() {
        return galleryRepository.findAllByOrderByDateAsc();
    }

    // ---------- DELETE ----------
    public void deleteGallery(Long galleryId) {

        Gallery gallery = galleryRepository.findById(galleryId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Gallery not found with id: " + galleryId)
                );

        if (gallery.getPic() != null) {
            SaveFile.deleteFile(gallery.getPic());
        }

        galleryRepository.delete(gallery);

        log.info("Gallery entry deleted | id={}", galleryId);
    }
}

