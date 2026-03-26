/* =============================================
   AMORA CAFE — BOOKING / RESERVATION SYSTEM
   ============================================= */

const Booking = {
    init() {
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setMinDate();
        }
    },

    // Set minimum date to today
    setMinDate() {
        const dateInput = document.getElementById('booking-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    },

    // Handle form submission
    handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('booking-name').value.trim();
        const phone = document.getElementById('booking-phone').value.trim();
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const guests = document.getElementById('booking-guests').value;
        const notes = document.getElementById('booking-notes').value.trim();

        // Validation
        if (!name || !phone || !date || !time || !guests) {
            Cart.showToast('Please fill in all required fields');
            return;
        }

        if (!this.isValidPhone(phone)) {
            Cart.showToast('Please enter a valid phone number');
            return;
        }

        // Check if selected date/time is in the past
        const selectedDate = new Date(`${date}T${time}`);
        if (selectedDate < new Date()) {
            Cart.showToast('Please select a future date and time');
            return;
        }

        // Format the date nicely
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format time to 12-hour
        const [h, m] = time.split(':');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        const formattedTime = `${hour12}:${m} ${ampm}`;

        // Create WhatsApp message
        const message = `🍽️ *Table Reservation — Amora Cafe*\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n📅 Date: ${formattedDate}\n🕐 Time: ${formattedTime}\n👥 Guests: ${guests}\n${notes ? `📝 Notes: ${notes}` : ''}\n\nPlease confirm my reservation!`;

        const encoded = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/91866918164?text=${encoded}`;

        // Show success modal
        Cart.showModal(
            'success',
            'Reservation Sent! 🎉',
            `Your table reservation for ${guests} guest(s) on ${formattedDate} at ${formattedTime} has been sent. We'll confirm via WhatsApp shortly!`
        );

        // Reset form
        document.getElementById('booking-form').reset();

        // Open WhatsApp after delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1500);
    },

    // Basic phone validation
    isValidPhone(phone) {
        const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
        return cleaned.length >= 10 && /^\d+$/.test(cleaned);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Booking.init());
