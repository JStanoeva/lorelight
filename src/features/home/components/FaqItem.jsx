import { useState } from "react";

// Each question keeps its own open state, so answers open independently: closing one answer
// never shifts the question the user is clicking. The answer stays in the DOM (only hidden),
// so aria-controls always points at an existing element. Each question is a row of the FAQ
// section's fade-in (useSectionReveal), so the questions follow each other quickly.
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
