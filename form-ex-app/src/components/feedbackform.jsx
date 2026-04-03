import { useState } from "react";

function FeedbackForm({ addFeedback }) {   
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    feedback: "",
    rating: ""
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addFeedback(formData);   

    setSubmitted(true);

    // reset form
    setFormData({
      username: "",
      email: "",
      feedback: "",
      rating: ""
    });
  };

  return (
    <div style={{ width: "300px", margin: "auto" }}>

      {submitted ? (
        <>
          <p>Thank you for your feedback!</p>
          <button onClick={() => setSubmitted(false)}>
            Give Another Feedback
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          
          <label>Name:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <br /><br />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <br /><br />

          <label>Feedback:</label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            required
          />

          <br /><br />

          <label>Rating:</label>
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Average</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>

          <br /><br />

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}

export default FeedbackForm;