$(document).ready(function () {
    // Initialize AOS Animation
    AOS.init({
        duration: 1000,
        once: true
    });

    // Dark/Light Theme Toggle
    $('#themeToggle').on('click', function () {
        $('body').toggleClass('dark-mode');
        const isDark = $('body').hasClass('dark-mode');
        $(this).html(isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Load Saved Theme
    if (localStorage.getItem('theme') === 'dark') {
        $('body').addClass('dark-mode');
        $('#themeToggle').html('<i class="fas fa-sun"></i>');
    }

    // Counter Animation on Scroll
    let animatedCounters = false;
    $(window).on('scroll', function () {
        const aboutOffset = $('#about').length ? $('#about').offset().top - 450 : 0;
        if ($(window).scrollTop() > aboutOffset && !animatedCounters) {
            $('.counter').each(function () {
                const $this = $(this);
                const countTo = $this.attr('data-target');
                $({ countNum: 0 }).animate({
                    countNum: countTo
                }, {
                    duration: 2000,
                    easing: 'swing',
                    step: function () {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function () {
                        $this.text(this.countNum + '+');
                    }
                });
            });
            animatedCounters = true;
        }
    });

    // Course Search Filter
    $('#courseSearch').on('keyup', function () {
        const query = $(this).val().toLowerCase();
        $('.course-item').each(function () {
            const title = $(this).attr('data-title').toLowerCase();
            const text = $(this).text().toLowerCase();
            if (title.indexOf(query) > -1 || text.indexOf(query) > -1) {
                $(this).fadeIn(300);
            } else {
                $(this).fadeOut(300);
            }
        });
    });

    // Course Details Database for Admission Slip
    const courseDetailsMap = {
        "Advanced Fashion Designing": { duration: "12 Months (1 Year)", fee: "₹85,000", registration: "₹5,000", batchStart: "1st & 15th of Every Month", timing: "10:00 AM - 01:00 PM / 02:00 PM - 05:00 PM" },
        "Pattern Making & Draping": { duration: "6 Months", fee: "₹45,000", registration: "₹3,000", batchStart: "10th of Every Month", timing: "10:30 AM - 01:30 PM" },
        "Bridal & Couture Design": { duration: "6 Months", fee: "₹55,000", registration: "₹5,000", batchStart: "5th of Every Month", timing: "02:00 PM - 05:00 PM" },
        "Fashion Boutique Management": { duration: "3 Months", fee: "₹30,000", registration: "₹2,000", batchStart: "1st of Every Month", timing: "11:00 AM - 01:00 PM" },
        "Digital & Manual Illustration": { duration: "4 Months", fee: "₹35,000", registration: "₹2,000", batchStart: "15th of Every Month", timing: "03:00 PM - 05:00 PM" },
        "Embroidery & Surface Design": { duration: "3 Months", fee: "₹25,000", registration: "₹2,000", batchStart: "20th of Every Month", timing: "10:00 AM - 12:30 PM" }
    };

    // Submit Admission Form & Generate Printable Slip
    $('#admissionForm').on('submit', function (e) {
        e.preventDefault();
        
        const formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            city: $('#city').val(),
            course_interested: $('#course').val(),
            message: $('#message').val()
        };

        const $btn = $(this).find('button[type="submit"]');
        $btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i> Generating Slip...');

        const selectedCourse = courseDetailsMap[formData.course_interested] || {
            duration: "6 Months", fee: "₹45,000", registration: "₹3,000", batchStart: "Next Upcoming Batch", timing: "Regular Morning / Afternoon Slots"
        };

        const regNo = 'AFA-' + Math.floor(100000 + Math.random() * 900000);
        const todayDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        $.ajax({
            url: '/api/enquiries',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                $('#formMessage')
                    .removeClass('d-none alert-danger')
                    .addClass('alert alert-success mt-3')
                    .html(`✨ <strong>Application Submitted Successfully!</strong><br>Registration No: <strong>${regNo}</strong>.<br><button id="openSlipBtn" class="btn btn-gold btn-sm mt-2"><i class="fas fa-file-pdf me-1"></i> View & Download Admission Slip PDF</button>`);
                
                // Build Slip Content
                const slipHtml = `
                    <div id="pdfPrintArea" style="background:#FFF8F0; padding:25px; border:2px solid #D4AF37; border-radius:12px; font-family:'Poppins', sans-serif; color:#222;">
                        <div style="text-align:center; border-bottom:2px dashed #D4AF37; padding-bottom:15px; margin-bottom:20px;">
                            <h2 style="font-family:'Playfair Display', serif; color:#111; margin:0; font-weight:bold; letter-spacing:1px;">ABHISHRE FASHION ACADEMY</h2>
                            <p style="margin:4px 0 0 0; font-size:12px; color:#D4AF37; font-weight:600; text-transform:uppercase;">Luxury Fashion & Design Education</p>
                            <p style="margin:2px 0 0 0; font-size:11px; color:#666;">Fashion Hub, Main Blvd, Mumbai | +91 98765 43210 | info@abhishrefashion.com</p>
                        </div>

                        <div style="background:#111; color:#D4AF37; padding:8px 15px; border-radius:6px; font-weight:bold; font-size:14px; text-align:center; margin-bottom:20px;">
                            OFFICIAL ADMISSION CONFIRMATION & FEE SLIP
                        </div>

                        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px;">
                            <tr>
                                <td style="padding:6px; font-weight:bold; width:30%; color:#555;">Registration No:</td>
                                <td style="padding:6px; font-weight:bold; color:#111;">${regNo}</td>
                                <td style="padding:6px; font-weight:bold; width:20%; color:#555;">Date:</td>
                                <td style="padding:6px; font-weight:bold; color:#111;">${todayDate}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px; font-weight:bold; color:#555;">Student Name:</td>
                                <td style="padding:6px; color:#111;">${escapeHtml(formData.name)}</td>
                                <td style="padding:6px; font-weight:bold; color:#555;">City:</td>
                                <td style="padding:6px; color:#111;">${escapeHtml(formData.city)}</td>
                            </tr>
                            <tr>
                                <td style="padding:6px; font-weight:bold; color:#555;">Mobile / Phone:</td>
                                <td style="padding:6px; color:#111;">${escapeHtml(formData.phone)}</td>
                                <td style="padding:6px; font-weight:bold; color:#555;">Email:</td>
                                <td style="padding:6px; color:#111;">${escapeHtml(formData.email)}</td>
                            </tr>
                        </table>

                        <div style="border:1px solid #E2E2DC; background:#FFF; border-radius:8px; padding:15px; margin-bottom:20px;">
                            <h4 style="font-family:'Playfair Display', serif; color:#D4AF37; margin-top:0; font-size:16px; border-bottom:1px solid #EEE; padding-bottom:8px;">
                                🎓 Selected Course & Batch Details
                            </h4>
                            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                <tr>
                                    <td style="padding:6px 0; font-weight:bold; width:35%;">Selected Course:</td>
                                    <td style="padding:6px 0; font-weight:bold; color:#111;">${escapeHtml(formData.course_interested)}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0; font-weight:bold;">Course Duration:</td>
                                    <td style="padding:6px 0; color:#333;">${selectedCourse.duration}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0; font-weight:bold;">Batch Schedule:</td>
                                    <td style="padding:6px 0; color:#333;">Starts ${selectedCourse.batchStart}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0; font-weight:bold;">Daily Class Timings:</td>
                                    <td style="padding:6px 0; color:#333;">${selectedCourse.timing}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="border:1px solid #E2E2DC; background:#FFF; border-radius:8px; padding:15px; margin-bottom:20px;">
                            <h4 style="font-family:'Playfair Display', serif; color:#D4AF37; margin-top:0; font-size:16px; border-bottom:1px solid #EEE; padding-bottom:8px;">
                                💳 Fee Breakdown & Payment Summary
                            </h4>
                            <table style="width:100%; border-collapse:collapse; font-size:13px;">
                                <tr style="border-bottom:1px solid #F0F0F0;">
                                    <td style="padding:8px 0; color:#555;">Total Course Tuition Fee:</td>
                                    <td style="padding:8px 0; text-align:right; font-weight:bold; color:#111;">${selectedCourse.fee}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #F0F0F0;">
                                    <td style="padding:8px 0; color:#555;">Seat Reservation / Reg. Fee:</td>
                                    <td style="padding:8px 0; text-align:right; font-weight:bold; color:#D4AF37;">${selectedCourse.registration}</td>
                                </tr>
                                <tr style="border-bottom:1px solid #F0F0F0;">
                                    <td style="padding:8px 0; color:#555;">Payment Mode Available:</td>
                                    <td style="padding:8px 0; text-align:right; color:#333;">UPI / NetBanking / Debit Card / EMI</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0; font-weight:bold; color:#111;">Application Status:</td>
                                    <td style="padding:8px 0; text-align:right;"><span style="background:#28a745; color:#FFF; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:bold;">CONFIRMED & PROCESSED</span></td>
                                </tr>
                            </table>
                        </div>

                        <div style="font-size:11px; color:#777; border-top:1px solid #DDD; padding-top:10px; text-align:center;">
                            * Note: Please present this slip or Registration No (<strong>${regNo}</strong>) at the academy desk during counselor verification.
                        </div>
                    </div>
                `;

                $('#slipReceiptContent').html(slipHtml);

                // Attach modal trigger button
                $('#openSlipBtn').off('click').on('click', function() {
                    const slipModal = new bootstrap.Modal(document.getElementById('slipModal'));
                    slipModal.show();
                });

                // Auto open modal
                const slipModal = new bootstrap.Modal(document.getElementById('slipModal'));
                slipModal.show();

                // Clear form
                $('#admissionForm')[0].reset();
            },
            error: function (err) {
                $('#formMessage')
                    .removeClass('d-none alert-success')
                    .addClass('alert alert-danger mt-3')
                    .text('⚠️ Failed to submit application. Please try again or contact us on WhatsApp.');
            },
            complete: function () {
                $btn.prop('disabled', false).text('Submit Application');
            }
        });
    });

    // Handle PDF Download Button
    $(document).on('click', '#downloadSlipBtn', function() {
        const element = document.getElementById('pdfPrintArea');
        const opt = {
            margin:       0.3,
            filename:     'Abhishre_Admission_Slip.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    function escapeHtml(text) {
        return $('<div>').text(text).html();
    }
});
