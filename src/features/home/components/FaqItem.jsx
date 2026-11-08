import { useState } from "react";

// Each item keeps its own open state, so closing one answer never shifts the question being
// clicked. The answer is only hidden, so aria-controls always has a target.
export default function FaqItem({ item }) {
  const [isOpen, setIsOpen] = useState(false);

  const questionId = `faq-question-${item.id}`;
  const answerId = `faq-answer-${item.id}`;

  function handleToggle() {
    setIsOpen((wasOpen) => !wasOpen);
  }

  return (
    <li className="faq-item" data-reveal-item="row">
      <h3 className="faq-question">
        <button
          id={questionId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={handleToggle}
          className="faq-button"
        >
          <span>{item.question}</span>
          <span className="faq-icon" aria-hidden="true" />
        </button>
      </h3>
      <div id={answerId} hidden={!isOpen} className="faq-answer">
        <p>{item.answer}</p>
      </div>
    </li>
  );
}
