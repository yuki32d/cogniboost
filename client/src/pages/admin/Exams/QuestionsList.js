import React, { useState } from "react";
import { Button, Table } from "antd";
import GenerateQuizModal from "./GenerateQuizModal"; // Import new modal

function QuestionsList({ examId, refreshData }) {
  const [showGenerateQuizModal, setShowGenerateQuizModal] = useState(false);

  return (
    <div>
      <Button type="primary" onClick={() => setShowGenerateQuizModal(true)}>
        Generate Quiz
      </Button>

      {/* New Modal for AI-generated Questions */}
      {showGenerateQuizModal && (
        <GenerateQuizModal
          examId={examId}
          setShowGenerateQuizModal={setShowGenerateQuizModal}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}

export default QuestionsList;
