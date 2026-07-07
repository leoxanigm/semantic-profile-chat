import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const [inputActive, setInputActive] = useState<boolean>(false);

  const currentSample = sampleQuestions[sampleIndex] ?? '';
  const placeholder =
    question || inputActive ? '' : currentSample.slice(0, visibleChars);
  const displayedAnswer = answer ? answer.slice(0, answerIndex) : '';

  // Load example questions used for the animated input placeholder
  useEffect(() => {
    const abortController = new AbortController();

    fetch('/api/sample-questions', { signal: abortController.signal })
      .then(response => response.json())
      .then(({ questions }: { questions: string[] }) => {
        setSampleQuestions(questions);
      })
      .catch(error => {
        if (error.name !== 'AbortError') console.log(error);
      });

    return () => abortController.abort();
  }, []);

  // Cycle through sample questions and animate them as input placeholders
  // This is only done when the input is not in focus
  useEffect(() => {
    if (sampleQuestions.length === 0 || inputActive) return;

    const currentSample = sampleQuestions[sampleIndex];
    let timeoutId: number | undefined;

    const intervalId = setInterval(() => {
      setVisibleChars(chars => {
        if (chars < currentSample.length) return chars + 1;

        clearInterval(intervalId);

        // When we have animated in the question, load the next one
        timeoutId = setTimeout(() => {
          setVisibleChars(0);
          setSampleIndex(index => (index + 1) % sampleQuestions.length);
        }, 1500);

        return chars;
      });
    }, 20);

    return () => {
      clearInterval(intervalId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [sampleQuestions, sampleIndex, inputActive]);

  // Animate in the answer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnswerIndex(i => {
        if (i < answer.length) return i + 1;

        clearInterval(intervalId);

        return i;
      });
    }, 5);

    return () => clearInterval(intervalId);
  }, [answer, answerIndex]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question
      })
    })
      .then(async response => {
        const result = await response.json();

        if (!response.ok) {
          setAnswer(result.error ?? 'The server returned an error.');
          setAnswerIndex(0);
          return;
        }

        if (result.matched) setAnswer(result.answer);
        else setAnswer(result.message ?? 'I could not find a reliable answer.');

        setAnswerIndex(0);
      })
      .catch(error => {
        console.error(error);
        setAnswer('An error occurred while trying to fetch an answer');
        setAnswerIndex(0);
      });
  }

  return (
    <>
      <section id='search'>
        <h1>Semantic Profile Chat</h1>
        <p>What do you want to know about Switzerland?</p>
        <small>
          <a
            className='external'
            href='https://github.com/leoxanigm/semantic-profile-chat'
            target='_blank'>
            repo
          </a>
          &nbsp;|&nbsp;
          <a
            className='external'
            href='https://en.wikipedia.org/wiki/Switzerland'
            target='_blank'>
            data source
          </a>
        </small>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={question}
            placeholder={placeholder}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
            onFocus={() => setInputActive(true)}
            onBlur={() => setInputActive(false)}
          />
        </form>
      </section>
      <section id='result'>
        <p>{displayedAnswer}</p>
      </section>
    </>
  );
}

export default App;
