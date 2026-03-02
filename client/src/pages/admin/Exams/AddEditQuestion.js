import { Form, message, Modal, Button } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addQuestionToExam, editQuestionById } from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import GenerateQuizModal from "./GenerateQuizModal"; // New AI Quiz Modal

function AddEditQuestion({
  topic,
  difficulty,
  showAddEditQuestionModal,
  setShowAddEditQuestionModal,
  refreshData,
  examId,
  selectedQuestion,
  setSelectedQuestion
}) {
  const dispatch = useDispatch();
  const [showGenerateQuizModal, setShowGenerateQuizModal] = useState(false);

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      const requiredPayload = {
        name: values.name,
        correctOption: values.correctOption,
        options: {
          A: values.A,
          B: values.B,
          C: values.C,
          D: values.D,
        },
        exam: examId,
      };

      let response;
      if (selectedQuestion) {
        response = await editQuestionById({
          ...requiredPayload,
          questionId: selectedQuestion._id,
        });
      } else {
        response = await addQuestionToExam(requiredPayload);
      }

      if (response.success) {
        message.success(response.message);
        refreshData();
        setShowAddEditQuestionModal(false);
      } else {
        message.error(response.message);
      }
      setSelectedQuestion(null);
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  console.log(topic, difficulty, examId); // Debugging line
  

  return (
    <>
      <Modal
        title={selectedQuestion ? "Edit Question" : "Add Question"}
        open={showAddEditQuestionModal}
        footer={false}
        onCancel={() => {
          setShowAddEditQuestionModal(false);
          setSelectedQuestion(null);
        }}
      >
        <Form
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            name: selectedQuestion?.name,
            A: selectedQuestion?.options?.A,
            B: selectedQuestion?.options?.B,
            C: selectedQuestion?.options?.C,
            D: selectedQuestion?.options?.D,
            correctOption: selectedQuestion?.correctOption,
          }}
        >
          <Form.Item name="name" label="Question">
            <input type="text" />
          </Form.Item>
          {/* <Form.Item name="correctOption" label="Correct Option">
            <input type="text" />
          </Form.Item> */}
          <Form.Item name="correctOption" label="Correct Option">
                              <select name="" id="">
                                <option value="">Select Option</option>
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </Form.Item>

          <div className="flex gap-3">
            <Form.Item name="A" label="Option A">
              <input type="text" />
            </Form.Item>
            <Form.Item name="B" label="Option B">
              <input type="text" />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item name="C" label="Option C">
              <input type="text" />
            </Form.Item>
            <Form.Item name="D" label="Option D">
              <input type="text" />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-2 gap-3">
            <button
              className="primary-outlined-btn"
              type="button"
              onClick={() => setShowAddEditQuestionModal(false)}
            >
              Cancel
            </button>
            <button className="primary-contained-btn">Save</button>
          </div>
        </Form>

        <div className="mt-5 flex gap-3">
          <Button type="primary" onClick={() => setShowGenerateQuizModal(true)}>
            Generate Quiz Questions
          </Button>
        </div>
      </Modal>

      {showGenerateQuizModal && (
        <GenerateQuizModal
          topic={topic}
          difficulty={difficulty}
          examId={examId}
          setShowGenerateQuizModal={setShowGenerateQuizModal}
          refreshData={refreshData}
        />
      )}
    </>
  );
}

export default AddEditQuestion;
