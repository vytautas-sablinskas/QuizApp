const question = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const choices = Array.from(document.getElementsByClassName('choice-container'));
const choicesText = Array.from(document.getElementsByClassName('choice-text'));

let currentQuestion = 1;
let correctAnswersAmount = 0;
let currentTriviaIndex = 0;
let trivia = [];
let classToApply = '';

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let fetchTrivia = async () => {
    const questionAmount = getRandomNumber(5, 10);
    const apiLink = `https://opentdb.com/api.php?amount=${questionAmount}`;

    return await fetch(apiLink)
        .then(response => response.json())
        .then(data => {
            let unformattedQuestions = data.results;
            return unformattedQuestions.map((unformattedQuestion) => {
                let answers = [...unformattedQuestion.incorrect_answers];
                let correctAnswerIndex = getRandomNumber(0, answers.length);
                answers.splice(correctAnswerIndex, 0, unformattedQuestion.correct_answer);

                return {
                    question: unformattedQuestion.question,
                    answers: answers,
                    correct_answer: unformattedQuestion.correct_answer
                };
            });
        });
}

let changeTriviaQuestionsAndAnswers = (triviaItem) => {
    question.innerText = triviaItem.question;
    choicesText.map((choice, index) => {
        if (index < triviaItem.answers.length) {
            choice.style.display = 'flex';
            choice.innerText = triviaItem.answers[index];
            return;
        }

        let choiceContainer = choices[index];
        choiceContainer.style.display = 'none';
    });
};


let displayNextQuestion = () => {
    if (currentTriviaIndex >= trivia.length) {
        localStorage.setItem('correctAnswersAmount', correctAnswersAmount + '/' + trivia.length);
        window.location.href = "../pages/end.html";
    }

    questionCounter.innerText = `${currentQuestion++}/${trivia.length}`;
    changeTriviaQuestionsAndAnswers(trivia[currentTriviaIndex]);
}

let checkIfCorrectAnswerChosen = (choiceText) => {
    if(currentTriviaIndex >= trivia.length) {
        return;
    }

    const correctAnswer = trivia[currentTriviaIndex++].correct_answer;
    let answeredCorrectly = choiceText === correctAnswer;

    return answeredCorrectly;
}

let addListenersToChoices = () => {
    choices.forEach((choice, index) => {
        choice.addEventListener('click', (e) => {
            const selectedAnswer = choicesText[index].innerText;
            let correctAnswer = checkIfCorrectAnswerChosen(selectedAnswer);
            if(correctAnswer) {
                correctAnswersAmount++;
                classToApply = 'correct';
            } else {
                classToApply = 'incorrect';
            }

            const selectedChoice = choicesText[index];
            selectedChoice.parentElement.classList.add(classToApply);
            setTimeout(() => {
                selectedChoice.parentElement.classList.remove(classToApply);
                displayNextQuestion();
            }, 1000);
        });
    });
}

let removeLoadingScreen = () => {
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

let startGame = async () => {
    addListenersToChoices();
    trivia = await fetchTrivia();
    removeLoadingScreen();
    displayNextQuestion();
};

startGame();
