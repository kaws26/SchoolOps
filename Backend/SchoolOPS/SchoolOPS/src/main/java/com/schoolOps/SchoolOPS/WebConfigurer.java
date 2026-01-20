package com.schoolOps.SchoolOPS;


import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Slf4j
@Configuration
public class WebConfigurer implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        ApplicationHome home = new ApplicationHome(SchoolOpsApplication.class);
        String path ="file://"+ home.getDir().toString()+ File.separator+"public/";
        log.info("Home Path: {}",home.getDir().toString());
        registry.addResourceHandler("/**").addResourceLocations(path);
    }

}

