const question = document.getElementById('question');
const questionCounter = document.getElementById('question-counter');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const choices = Array.from(document.getElementsByClassName('choice-container'));
const choicesText = Array.from(document.getElementsByClassName('choice-text'));
const choicesPrefix = Array.from(document.getElementsByClassName('choice-prefix'));

let currentQuestion = 1;
let correctAnswersAmount = 0;
let currentTriviaIndex = 0;
let trivia = [];
let classToApply = '';

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let formatQuestionAndAnswers = (question, answers, correct_answer) => {
    let formattedQuestion = question
        .replace(/&quot;/g, '\"')
        .replace(/&#039;/g, "'");

    let formattedAnswers = answers.map((answer) => {
        return answer
            .replace(/&quot;/g, '\"')
            .replace(/&#039;/g, "'");
    });

    let formattedCorrectAnswer = correct_answer
        .replace(/&quot;/g, '\"')
        .replace(/&#039;/g, "'");

    return {
        question: formattedQuestion,
        answers: formattedAnswers,
        correct_answer: formattedCorrectAnswer
    };
};

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
				let formattedQuestionAndAnswers = formatQuestionAndAnswers(unformattedQuestion.question, answers, unformattedQuestion.correct_answer);

                return {
                    question: formattedQuestionAndAnswers.question,
                    answers: formattedQuestionAndAnswers.answers,
                    correct_answer: formattedQuestionAndAnswers.correct_answer
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

let switchContainerState = (state) => {
    if(state === 'disable') {
        choices.forEach((choice, index) => {
            choice.classList.add('disabled');
            choicesText[index].classList.add('disabled');
            choicesPrefix[index].classList.add('disabled');
        });
    }

    if(state === 'enable') {
        choices.forEach((choice, index) => {
            choice.classList.remove('disabled');
            choicesText[index].classList.remove('disabled');
            choicesPrefix[index].classList.remove('disabled');
        });
    }
}

let addListenersToChoices = () => {
    choices.forEach((choice, index) => {
        choice.addEventListener('click', (e) => {
            if (e.target.classList.contains('disabled')) {
                return;
            }

            switchContainerState('disable');
            

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
                switchContainerState('enable');
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
