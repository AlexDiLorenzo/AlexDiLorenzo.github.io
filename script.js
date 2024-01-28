let chatMessages = null;
let pdfData = {};

window.addEventListener('DOMContentLoaded', (event) => {
    const whoIAmButton = document.getElementById('whoIAm');
    
    chatMessages = document.querySelector('.chat-messages');

    if (whoIAmButton) {
        whoIAmButton.addEventListener('click', function() {
            const whoIAmContent = document.getElementById('whoIAm'); // Ensure this is the correct ID for the content container.
            whoIAmContent.innerHTML = '<p>Content for the "Who I am" page</p>';
        });
    }


    displayInitialMessage(); 
});

function displayInitialMessage() {
    const initialMessage = "Here, you can ask me anything you want, an AI will answer for me, but don't worry, she knows everything about me ahah. You are limited to 3 questions of maximum 100 characters.";
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('bot-message');
    messageDiv.textContent = initialMessage;
    chatMessages.appendChild(messageDiv);
}

let questionCount = 0;

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const maxQuestionLength = 100;
    const maxQuestionsAllowed = 3;

    if (questionCount < maxQuestionsAllowed) {
        if (chatInput.value.trim() !== '' && chatInput.value.length <= maxQuestionLength) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('user-message');
            messageDiv.textContent = chatInput.value;
            chatMessages.appendChild(messageDiv);

            askOpenAI(chatInput.value);

            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            questionCount++;
        } else if (chatInput.value.length > maxQuestionLength) {
            alert("Question too long. Please limit to 100 characters.");
        }
    } else {
        alert("Maximum number of questions reached.");
    }
}

function displayContent(sectionId) {
    const whoIAmContent = document.getElementById('whoIAmContent');
    const talkWithMeContent = document.getElementById('talkWithMeContent');

    // Initially hide both sections
    whoIAmContent.style.display = 'none';
    talkWithMeContent.style.display = 'none';

    // Show the requested section
    if (sectionId === 'whoIAmContent') {
        whoIAmContent.style.display = 'block';
    } else if (sectionId === 'talkWithMeContent') {
        talkWithMeContent.style.display = 'block';
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


