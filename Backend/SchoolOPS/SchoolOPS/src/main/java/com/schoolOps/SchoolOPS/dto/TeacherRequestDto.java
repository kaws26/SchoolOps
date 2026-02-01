package com.schoolOps.SchoolOPS.dto;

import com.schoolOps.SchoolOPS.entity.Teacher;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRequestDto {

    private LocalDate date;
    private String name;
    private String fatherName;
    private String email;
    private Long numbers;
    private int salary;

    private String password;
    private String role;

    private AddressDto address;
    private List<Long> courseIds;

    public Teacher toEntity() {
        Teacher teacher = new Teacher();
        teacher.setDate(this.date);
        teacher.setName(this.name);
        teacher.setFatherName(this.fatherName);
        teacher.setEmail(this.email);
        teacher.setNumbers(this.numbers);
        teacher.setSalary(this.salary);
        return teacher;
    }
}
