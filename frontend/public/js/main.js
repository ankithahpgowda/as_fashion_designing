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

    // Submit Admission Form
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
        $btn.prop('disabled', true).text('Submitting...');

        $.ajax({
            url: '/api/enquiries',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                $('#formMessage')
                    .removeClass('d-none alert-danger')
                    .addClass('alert alert-success')
                    .html('✨ Thank you! Your application has been submitted successfully. Our admission team will contact you shortly.');
                $('#admissionForm')[0].reset();
            },
            error: function (err) {
                // Fallback to direct WhatsApp submit if server is unreachable/error
                const waMessage = encodeURIComponent(
                    `*New Admission Application*\n` +
                    `*Name:* ${formData.name}\n` +
                    `*Email:* ${formData.email}\n` +
                    `*Phone:* ${formData.phone}\n` +
                    `*City:* ${formData.city}\n` +
                    `*Course:* ${formData.course_interested}\n` +
                    `*Message:* ${formData.message || 'N/A'}`
                );
                const waUrl = `https://wa.me/919876543210?text=${waMessage}`;
                
                $('#formMessage')
                    .removeClass('d-none alert-danger')
                    .addClass('alert alert-info')
                    .html(`✨ Submitting via WhatsApp... <a href="${waUrl}" target="_blank" class="fw-bold text-dark text-decoration-underline">Click here to open WhatsApp</a>`);
                
                window.open(waUrl, '_blank');
            },
            complete: function () {
                $btn.prop('disabled', false).text('Submit Application');
            }
        });
    });
});
