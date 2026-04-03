import { useState, useEffect } from "react";
import FeedbackForm from "./components/feedbackform";
import FeedbackList from "./components/feedbacklist";

function App() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("feedbacks"));
    if (storedData) {
      setFeedbacks(storedData);
    }
  }, []);

  const addFeedback = (data) => {
    const updated = [...feedbacks, data];
    setFeedbacks(updated);

    localStorage.setItem("feedbacks", JSON.stringify(updated));
  };

  return (
    <div>
      <h1>Feedback App</h1>

      <FeedbackForm addFeedback={addFeedback} />

      <button onClick={() => setShowList(!showList)}>
        {showList ? "Hide Feedbacks" : "View Feedbacks"}
      </button>

      {showList && <FeedbackList feedbacks={feedbacks} />}
    </div>
  );
}

export default App;