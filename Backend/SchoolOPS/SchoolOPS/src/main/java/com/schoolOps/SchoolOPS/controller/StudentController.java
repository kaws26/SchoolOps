package com.schoolOps.SchoolOPS.controller;


import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.schoolOps.SchoolOPS.dto.*;
import com.schoolOps.SchoolOPS.entity.*;
import com.schoolOps.SchoolOPS.service.*;
import org.json.JSONObject;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private float amount; // ⚠️ acceptable for demo, not for prod

    private final AccountService accountService;
    private final StudentService studentService;
    private final UserService userService;
    private final NoticeService noticeService;
    private final CourseService courseService;
    private final ClassRoomService classRoomService;

    // =================================================
    // STUDENT PROFILE
    // =================================================
    @GetMapping("/profile")
    public StudentResponseDto getStudentProfile(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        Student student = user.getStudent();
        // Ensure courses are loaded
        if (student.getCourses() != null) {
            student.getCourses().size(); // initialize lazy collection
        }
        return StudentResponseDto.fromEntity(student);
    }

    // =================================================
    // NOTICE BOARD
    // =================================================
    @GetMapping("/notices")
    public List<NoticeResponseDto> getNotices() {
        return noticeService.getAllSortedNotice().stream().map(NoticeResponseDto::fromEntity).collect(Collectors.toList());
    }

    // =================================================
    // COURSES
    // =================================================
    @GetMapping("/courses")
    public List<CourseResponseDto> getCourses(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        List<Course> courses = user.getStudent().getCourses();
        return courses.stream().map(CourseResponseDto::fromEntity).collect(Collectors.toList());
    }

    // =================================================
    // ATTENDANCE
    // =================================================
    @GetMapping("/attendance/{courseId}")
    public List<String> getAttendance(
            @PathVariable Long courseId,
            Principal principal
    ) {

        User user = userService.getUserByUsername(principal.getName());
        Long studentId = user.getStudent().getId();

        List<Attendence> attendance =
                studentService.getAttendence(courseId, studentId);

        List<String> dates = new ArrayList<>();
        SimpleDateFormat df = new SimpleDateFormat("MMMM/dd/yyyy");

        attendance.forEach(a -> dates.add(df.format(a.getDate())));
        return dates;
    }

    // =================================================
    // ACCOUNT
    // =================================================
    @GetMapping("/account")
    public AccountResponseDto getAccount(Principal principal) {
        Account account = userService
                .getUserByUsername(principal.getName())
                .getStudent()
                .getAccount();
        // Ensure transactions are loaded
        if (account.getTransactions() != null) {
            account.getTransactions().size();
        }
        return AccountResponseDto.fromEntity(account);
    }

    // =================================================
    // PAYMENT (RAZORPAY)
    // =================================================
    @PostMapping("/payment/request")
    public String createPayment(@RequestBody Map<String, Object> data)
            throws Exception {

        this.amount = Float.parseFloat(data.get("amount").toString());

        RazorpayClient client = new RazorpayClient(
                "rzp_test_SGUXdDf8BB9T6g",
                "cWsUxkn22eyHmovt248wLiEL"
        );

        JSONObject options = new JSONObject();
        options.put("amount", amount * 100);
        options.put("currency", "INR");
        options.put("receipt", "txn_123456");

        Order order = client.orders.create(options);
        return order.toString();
    }

    @PostMapping("/payment/success")
    public String paymentSuccess(@RequestBody Map<String, Object> data) {

        Long accountId =
                Long.parseLong(data.get("account_id").toString());

        Transaction transaction = new Transaction();
        transaction.setAmount(this.amount);
        transaction.setType("CREDIT");
        transaction.setMode("ONLINE");
        transaction.setRemarks(
                "SELF / PAYMENT ID - " + data.get("payment_id")
        );

        accountService.makeTransaction(transaction, accountId);
        return "Payment recorded";
    }

    // =================================================
    // CLASSROOM
    // =================================================
    @GetMapping("/classroom/{courseId}")
    public List<ClassWork> getClassroom(
            @PathVariable Long courseId
    ) {
        Course course = courseService.getCourseById(courseId);
        return course.getClassRoom().getClasswork();
    }

    @PostMapping("/classroom/work/submit")
    public String submitWork(
            @RequestPart("work") Work work,
            @RequestPart("file") MultipartFile file,
            @RequestParam Long classWorkId,
            Principal principal
    ) {

        User user = userService.getUserByUsername(principal.getName());
        Student student = user.getStudent();

        work.setStudent(student);
        work.setClassWork(
                classRoomService.getClassWorkById(classWorkId)
        );

        classRoomService.saveWork(file, work);
        return "Work submitted successfully";
    }
}

