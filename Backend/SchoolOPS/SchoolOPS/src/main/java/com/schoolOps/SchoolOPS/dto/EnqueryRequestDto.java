package com.schoolOps.SchoolOPS.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnqueryRequestDto {
    private String email;
    private Long mobile;
    private String subject;
    private String status;
    private String name;
    private String message;

    public com.schoolOps.SchoolOPS.entity.Enquery toEntity() {
        com.schoolOps.SchoolOPS.entity.Enquery enquery = new com.schoolOps.SchoolOPS.entity.Enquery();
        enquery.setEmail(this.email);
        enquery.setMobile(this.mobile);
        enquery.setSubject(this.subject);
        enquery.setName(this.name);
        enquery.setMessage(this.message);
        return enquery;
    }
}