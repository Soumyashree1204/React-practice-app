function FeedbackList({ feedbacks }) {
  return (
    <div>

      {feedbacks.length === 0 ? (
        <p>feedback</p>
      ) : (
        feedbacks.map((item, index) => (
          <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <p><b>Name:</b> {item.username}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Feedback:</b> {item.feedback}</p>
            <p><b>Rating:</b> {item.rating}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default FeedbackList;