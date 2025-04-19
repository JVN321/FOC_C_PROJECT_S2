function sendFeedback() {
    const feedback = document.getElementById("feedback").value;
  
    fetch('http://localhost:8080', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: feedback
    })
    .then(response => alert("Feedback sent!"))
    .catch(error => alert("Error: " + error));
  }
  