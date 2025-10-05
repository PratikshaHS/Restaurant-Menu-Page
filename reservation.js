document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservationForm');
    const messageDiv = document.getElementById('reservation-message');
    
    // Set minimum date to today
    const dateInput = document.getElementById('reservation-date');
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const minDate = yyyy + '-' + mm + '-' + dd;
    dateInput.min = minDate;
    
    // Set default time to next hour
    const timeInput = document.getElementById('reservation-time');
    const nextHour = (today.getHours() + 1) % 24;
    const minutes = String(today.getMinutes()).padStart(2, '0');
    timeInput.value = `${String(nextHour).padStart(2, '0')}:${minutes}`;
    
    // Handle form submission
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitButton = reservationForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitButton.disabled = true;
            
            // Simulate form submission (in a real app, you would send this to a server)
            setTimeout(function() {
                // Reset form
                reservationForm.reset();
                
                // Show success message
                showMessage('Your reservation has been submitted successfully! We will contact you shortly to confirm.', 'success');
                
                // Reset button
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                // Clear message after 5 seconds
                setTimeout(function() {
                    messageDiv.style.display = 'none';
                }, 5000);
                
            }, 1500);
        });
    }
    
    // Helper function to show messages
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = 'reservation-message ' + type;
        messageDiv.style.display = 'block';
    }
    
    // Add input validation
    const phoneInput = document.getElementById('reservation-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Only allow numbers, spaces, and common phone characters
            this.value = this.value.replace(/[^0-9+\-()\s]/g, '');
        });
    }
    
    // Add smooth scrolling to reservation section
    const reservationLinks = document.querySelectorAll('a[href="#reservations"]');
    reservationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
