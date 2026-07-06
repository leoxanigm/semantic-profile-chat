import {
  useState,
  type ChangeEvent,
  type SubmitEvent
} from 'react';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  return (
    <>
      <section id='search'>
        <h1>Semantic Profile Chat</h1>
        <p>Type a question and hit enter.</p>
        <form
          onSubmit={(e: SubmitEvent) => {
            e.preventDefault();
            console.log('test');
          }}>
          <input
            type='text'
            value={question}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuestion(e.target.value)
            }
          />
        </form>
      </section>
      <section id='result'>
        <p>{answer}</p>
      </section>
    </>
  );
}

export default App;
