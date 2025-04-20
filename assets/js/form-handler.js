/**
 * Form submission handler for complaint forms
 */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('complaintForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Create URL encoded data - this matches the format the C program expects
            const formElements = form.elements;
            let formData = '';
            
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                if (element.name && element.value) {
                    if (formData !== '') {
                        formData += '&';
                    }
                    formData += encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
                }
            }
            
            // Create XMLHttpRequest for AJAX submission
            const xhr = new XMLHttpRequest();
            xhr.open('POST', form.action, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            // Handle the response
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Show success message
                    alert('Thank you! Your complaint has been submitted successfully.');
                    // Redirect to home page
                    window.location.href = 'index.html';
                } else {
                    alert('There was an error submitting your complaint. Please try again.');
                }
            };
            
            // Handle errors
            xhr.onerror = function() {
                alert('There was an error submitting your complaint. Please try again.');
            };
            
            // Send the form data
            xhr.send(formData);
        });
    }
});