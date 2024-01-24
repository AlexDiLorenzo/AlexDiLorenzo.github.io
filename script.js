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
    

    mainContent.style.display = 'none';
    chatContent.style.display = 'none';
    

    if (sectionId === 'whoIAm') {
        mainContent.style.display = 'block';
    } else if (sectionId === 'talkWithMe') {
        chatContent.style.display = 'block';
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


