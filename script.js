let chatMessages = null;
let pdfData = {};

window.addEventListener('DOMContentLoaded', (event) => {
    const whoIAmButton = document.getElementById('whoIAm');
    const myProjectButton = document.getElementById('myProject');
    chatMessages = document.querySelector('.chat-messages');

    if (whoIAmButton) {
        whoIAmButton.addEventListener('click', function() {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<p>Content for the "Who I am" page</p>';
        });
    }

    if (myProjectButton) {
        myProjectButton.addEventListener('click', function() {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '<p>Content for the "My Project" page</p>';
        });
    }
    displayInitialMessage(); 
});

function displayInitialMessage() {
  const initialMessage = "Here, you can ask me anything you want, an AI will answer for me, but don't worry, she knows everything about me ahah. You are limited to 3 questions of maximum 100 characters.";
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('bot-message'); // Assuming 'bot-message' is the class for chat bot messages
  messageDiv.textContent = initialMessage;
  chatMessages.appendChild(messageDiv);
}

let questionCount = 0; // Initialize a counter for questions

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const maxQuestionLength = 100; // Maximum length for a question
    const maxQuestionsAllowed = 3; // Maximum number of questions allowed

    // Check if question count is less than the maximum allowed
    if (questionCount < maxQuestionsAllowed) {
        if (chatInput.value.trim() !== '' && chatInput.value.length <= maxQuestionLength) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('user-message');
            messageDiv.textContent = chatInput.value;
            chatMessages.appendChild(messageDiv);

            askOpenAI(chatInput.value);

            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            questionCount++; // Increment the question count
        } else if (chatInput.value.length > maxQuestionLength) {
            alert("Question too long. Please limit to 100 characters.");
        }
    } else {
        alert("Maximum number of questions reached.");
    }
}

function displayContent(sectionId) {
    const mainContent = document.querySelector('.content');
    const chatContent = document.querySelector('.chat-content');
    const projectContent = document.querySelector('.my-project-content'); // Add this line

    mainContent.style.display = 'none';
    chatContent.style.display = 'none';
    projectContent.style.display = 'none'; // Add this line

    if (sectionId === 'whoIAm') {
        mainContent.style.display = 'block';
    } else if (sectionId === 'talkWithMe') {
        chatContent.style.display = 'block';
    } else if (sectionId === 'myProject') {
        projectContent.style.display = 'block'; // Add this line
    }
}


async function extractPDFContent(pdfUrl) {
  try {
      let pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      let total = pdf.numPages;
      let contentArray = [];

      for (let i = 1; i <= total; i++) {
          let page = await pdf.getPage(i);
          let textContent = await page.getTextContent();
          let pageText = textContent.items.map(item => item.str).join(' ');
          contentArray.push(pageText);
      }

      pdfData["CompleteContent"] = contentArray.join(' ');
      console.log("Complete PDF Content Stored:", pdfData);
  } catch (error) {
      console.error("Error in extracting PDF content:", error);
  }
}




function askOpenAI(question) {
    const pdfContent = pdfData["CompleteContent"] || "No PDF content available.";

    // Send the question along with the PDF content to the Flask backend
    fetch('https://alexandre-dilorenzo-website-2d8e129e4a71.herokuapp.com/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: question, pdfContent: pdfContent })
    })
    .then(response => response.json())
    .then(data => {
        const answer = data.answer;
        displayAnswer(answer);
    })
    .catch(error => {
        console.error('Error:', error);
        displayAnswer("Sorry, an error occurred.");
    });
}



function displayAnswer(answer) {
  const botMessageDiv = document.createElement('div');
  botMessageDiv.classList.add('bot-message');
  botMessageDiv.textContent = answer || "No response found.";
  chatMessages.appendChild(botMessageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

extractPDFContent('TalkWithMe_Database.pdf');


document.querySelectorAll('.movie').forEach(movie => {
    const stars = movie.querySelectorAll('.star');

    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseover', () => {
            highlightStars(stars, star.dataset.value);
        });

        // Click event to set the rating
        star.addEventListener('click', () => {
            movie.dataset.rating = star.dataset.value; // Store the rating value
            highlightStars(stars, star.dataset.value, true);
        });

        // Reset to the selected rating when mouse leaves the rating area
        movie.querySelector('.rating').addEventListener('mouseleave', () => {
            const selectedRating = movie.dataset.rating || '0';
            highlightStars(stars, selectedRating, true);
        });
    });
});

document.getElementById('submitRatings').addEventListener('click', () => {
    const ratings = Array.from(document.querySelectorAll('.movie')).map(movie => movie.dataset.rating || '0');

    // Log the ratings to console
    console.log('Submitted Ratings:', ratings);

    fetch('https://alexandre-dilorenzo-website-2d8e129e4a71.herokuapp.com/recommend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ratings: ratings })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Received data:", data); // Log the received data
        displayRecommendations(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


function displayRecommendations(recommendations) {
    const recommendationList = document.getElementById('recommendationList');
    if (!recommendationList) {
        console.error('recommendationList element not found');
        return;
    }
    recommendationList.innerHTML = ''; // Clear existing recommendations

    // Find the highest score in the recommendations
    const maxScore = Math.max(...recommendations.map(movie => movie.score));

    recommendations.forEach(movie => {
        const listItem = document.createElement('li');

        // Normalize the score to a percentage of the max score
        const normalizedScore = maxScore ? (movie.score / maxScore * 100).toFixed(2) : 'N/A';
        listItem.textContent = `${movie.title} - Match Score: ${normalizedScore}%`;
        recommendationList.appendChild(listItem);
    });
}




function highlightStars(stars, value, persist = false) {
    stars.forEach((star, index) => {
        star.style.color = (index < value) ? 'yellow' : 'gray';
    });

    // If persist is false, reset the color after a short delay
    if (!persist) {
        setTimeout(() => {
            const currentRating = stars[0].closest('.movie').dataset.rating || '0';
            stars.forEach((star, index) => {
                star.style.color = (index < currentRating) ? 'yellow' : 'gray';
            });
        }, 300); // Adjust delay as needed
    }
}
