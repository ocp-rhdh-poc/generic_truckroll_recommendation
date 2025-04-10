import React, { useState } from "react";
import { TextInput, Button, Header, HeaderName } from "@carbon/react";

const EditableText = () => {
  const [text, setText] = useState("");
  const [retrievedText, setRetrievedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async () => {
    // Simulate backend call
    const response = await fetch("/api/retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text })
    });
    const data = await response.json();
    setRetrievedText(data.result);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Simulate update to backend
    await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedText: retrievedText })
    });
    setIsEditing(false);
  };

  return (
    <div>
      <Header>
        <HeaderName prefix="">My App</HeaderName>
      </Header>
      <div style={{ maxWidth: "400px", margin: "20px auto" }}>
        {!retrievedText && (
          <TextInput
            id="user-input"
            labelText="Enter text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}
        {!retrievedText && (
          <Button onClick={handleSubmit} style={{ marginTop: "10px" }}>
            Submit
          </Button>
        )}
        {retrievedText && (
          <div>
            {isEditing ? (
              <TextInput
                id="edit-input"
                labelText="Edit text"
                value={retrievedText}
                onChange={(e) => setRetrievedText(e.target.value)}
              />
            ) : (
              <p>{retrievedText}</p>
            )}
            <Button onClick={isEditing ? handleSave : handleEdit} style={{ marginTop: "10px" }}>
              {isEditing ? "Save" : "Edit"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableText;
