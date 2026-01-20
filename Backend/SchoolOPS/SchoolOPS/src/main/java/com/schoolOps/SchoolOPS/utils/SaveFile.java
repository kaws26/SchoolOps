package com.schoolOps.SchoolOPS.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;

import com.schoolOps.SchoolOPS.SchoolOpsApplication;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.web.multipart.MultipartFile;


import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class SaveFile {

    private static final SecureRandom RANDOM = new SecureRandom();

    private SaveFile() {
        // utility class
    }

    public static String saveFile(MultipartFile file) {

        try {
            ApplicationHome home = new ApplicationHome(SchoolOpsApplication.class);
            String basePath = home.getDir().getAbsolutePath();

            Path imgDir = Paths.get(basePath, "public", "img");
            Files.createDirectories(imgDir);

            String randomPrefix = String.valueOf(100000 + RANDOM.nextInt(900000));
            String finalFileName = randomPrefix + "_" + file.getOriginalFilename();

            Path targetPath = imgDir.resolve(finalFileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            log.debug("File saved successfully | filename={}", finalFileName);
            return finalFileName;

        } catch (Exception ex) {
            log.error("Failed to save file", ex);
            return null;
        }
    }

    public static void deleteFile(String fileName) {

        try {
            ApplicationHome home = new ApplicationHome(SchoolOpsApplication.class);
            String basePath = home.getDir().getAbsolutePath();

            Path filePath = Paths.get(basePath, "public", "img", fileName);

            if (Files.deleteIfExists(filePath)) {
                log.debug("File deleted successfully | filename={}", fileName);
            }

        } catch (Exception ex) {
            log.error("Failed to delete file | filename={}", fileName, ex);
        }
    }
}
