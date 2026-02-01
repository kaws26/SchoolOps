package com.schoolOps.SchoolOPS.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.schoolOps.SchoolOPS.entity.Notice;
import com.schoolOps.SchoolOPS.repository.NoticeRepository;

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
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final CloudinaryService cloudinaryService;

    // ---------- READ ----------
    public List<Notice> getAllNotice() {
        return noticeRepository.findAll();
    }

    public List<Notice> getAllSortedNotice() {
        return noticeRepository.findAllByOrderByDateDesc();
    }

    public Notice getNoticeById(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Notice not found with id: " + noticeId)
                );
    }

    // ---------- CREATE ----------
    public Notice saveNotice(Notice notice) {
        notice.setDate(LocalDateTime.now());
        Notice saved = noticeRepository.save(notice);
        log.info("Notice created | id={}", saved.getId());
        return saved;
    }

    public Notice saveNoticeWithFile(Notice notice, MultipartFile file) {

        notice.setDate(LocalDateTime.now());

        if (file != null && !file.isEmpty()) {
            Map<String, Object> upload = cloudinaryService.uploadImage(file);
            notice.setImageUrl(upload.get("secure_url").toString());
            notice.setImagePublicId(upload.get("public_id").toString());
        }

        Notice saved = noticeRepository.save(notice);
        log.info("Notice created with image | id={}", saved.getId());
        return saved;
    }

    // ---------- DELETE ----------
    public void deleteNotice(Long noticeId) {

        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Notice not found with id: " + noticeId)
                );

        cloudinaryService.deleteImage(notice.getImagePublicId());

        noticeRepository.delete(notice);
        log.info("Notice deleted | id={}", noticeId);
    }
}
