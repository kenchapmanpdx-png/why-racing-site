/**
 * WHY RACING EVENTS Email Signup Form Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('email-signup-form');
    if (!signupForm) return;

    const statusMessage = document.getElementById('signup-status');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset state
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Signing up...';

        const formData = new FormData(signupForm);
        const data = {
            email: formData.get('email'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            source: formData.get('source') || 'website',
            website: formData.get('website') // Honeypot
        };

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                signupForm.innerHTML = `
                    <div class="signup-success" role="alert">
                        <i class="fas fa-check-circle"></i>
                        <strong>You're in!</strong><br>
                        We'll keep you posted on upcoming races and events.
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            statusMessage.textContent = error.message || 'Something went wrong. Please try again.';
            statusMessage.className = 'status-message error';
            statusMessage.style.color = '#dc2626';
            statusMessage.style.fontSize = '14px';
            statusMessage.style.marginTop = '10px';
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});
